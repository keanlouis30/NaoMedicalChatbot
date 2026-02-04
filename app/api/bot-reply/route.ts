import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { translatedText, userRole, botLanguage } = await request.json();

    if (!translatedText || !userRole || !botLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: translatedText, userRole, botLanguage' },
        { status: 400 }
      );
    }

    let prompt = '';
    
    if (userRole === 'patient') {
      // Bot is a doctor
      prompt = `You are a professional, empathetic doctor. The patient just said: "${translatedText}". 
Reply in ${botLanguage} with a medical follow-up question or advice. Be concise (2-3 sentences max). 
Provide ONLY your response, nothing else.`;
    } else {
      // Bot is a patient with symptoms
      prompt = `You are a patient feeling unwell with symptoms like headache, fever, and fatigue. The doctor said: "${translatedText}". 
Reply in ${botLanguage} as the patient would, describing symptoms or asking questions. Be concise (2-3 sentences max).
Provide ONLY your response, nothing else.`;
    }

    // Use Gemini REST API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    const botReply = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ botReply });
  } catch (error) {
    console.error('Bot reply error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bot reply' },
      { status: 500 }
    );
  }
}
