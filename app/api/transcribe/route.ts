import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetLanguage = formData.get('targetLanguage') as string;

    if (!audioFile || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: audio, targetLanguage' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Audio = buffer.toString('base64');

    const prompt = `Transcribe this audio and then translate it to ${targetLanguage}. 
Provide the response in this exact format:
Original: [transcribed text]
Translation: [translated text]`;

    // Use Gemini REST API directly with inline data
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: audioFile.type,
                  data: base64Audio
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Parse the response
    const originalMatch = responseText.match(/Original:\s*(.+?)(?=\nTranslation:|$)/s);
    const translationMatch = responseText.match(/Translation:\s*(.+?)$/s);

    const original = originalMatch ? originalMatch[1].trim() : responseText;
    const translation = translationMatch ? translationMatch[1].trim() : responseText;

    return NextResponse.json({ 
      original,
      translation 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
