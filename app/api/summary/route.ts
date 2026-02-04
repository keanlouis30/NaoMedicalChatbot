import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing or invalid messages array' },
        { status: 400 }
      );
    }

    // Format conversation for summarization
    const conversation = messages
      .map((msg: any) => {
        const role = msg.sender === 'user' ? msg.role : `bot (${msg.role === 'doctor' ? 'patient' : 'doctor'})`;
        return `${role}: ${msg.original_text} (${msg.translated_text || ''})`;
      })
      .join('\n');

    const prompt = `You are a medical professional. Analyze this doctor-patient conversation and provide a concise medical summary.

Conversation:
${conversation}

Provide a structured summary with these sections:
1. **Chief Complaint**: Main reason for consultation
2. **Symptoms**: Key symptoms mentioned
3. **Diagnosis/Assessment**: Medical insights or provisional diagnosis
4. **Medications**: Any medications discussed
5. **Follow-up Actions**: Recommended next steps

Keep it concise and medically accurate.`;

    // Use Gemini 2.0 Flash REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
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
    const summary = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate medical summary' },
      { status: 500 }
    );
  }
}
