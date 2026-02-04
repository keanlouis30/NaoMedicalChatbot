Assignment Overview
Project Title: Healthcare Doctor–Patient Translation Web Application

Your task is to design and build a full-stack web application that acts as a real-time translation bridge between a doctor and a patient. This project is intended to evaluate your ability to architect a multi-feature application, integrate AI or LLM APIs, handle audio data, and ship a working, deployed product under time constraints.

Scope & Timeline
Time Allowed: 12 hours

Submission Format: Public GitHub repository and deployed live application

Important: While full completeness is not expected, missing a deployed link or basic documentation may affect evaluation

Core Functionalities (Mandatory)
1. Real-Time Doctor–Patient Translation

Support two roles: Doctor and Patient

Messages typed or spoken by one role should be translated into the selected language of the other role in near real time

2. Text Chat Interface

Clean and intuitive chat UI

Clear visual distinction between Doctor and Patient messages

3. Audio Recording & Storage

Ability to record audio directly from the browser

Recorded audio clips should be visible and playable within the conversation thread

4. Conversation Logging

Log text and audio interactions with timestamps

Conversation history should persist beyond the active session

5. Conversation Search

Ability to search keywords or phrases across logged conversations

Highlight matched text and show surrounding context

6. AI-Powered Summary

Generate a concise summary at any point during or after a conversation

Highlight medically important points such as symptoms, diagnoses, medications, and follow-up actions

Technical Expectations
Full-stack web application (frontend and backend)

AI or LLM integration for translation and summarization

Audio handling and basic storage

Clean, readable, and well-organized code

Mobile-friendly UI

Deployment on a public platform (e.g., Vercel, Render, Railway, etc.)

Submission Requirements
Please submit the following. Partial implementations are acceptable as long as your work is clearly explained.

Public GitHub Repository

Single repository

Clear project structure

README.md including:

Project overview

Features attempted and completed

Tech stack used

AI tools and resources leveraged

Known limitations, trade-offs, or unfinished parts

Deployed Live Link

Application should be accessible, even if partially complete


1. Technical Stack
Frontend/Backend: Next.js (App Router).

AI: Gemini API (using gemini-1.5-flash for the chat/translation for speed, and gemini-1.5-pro for the Medical Summary).

Database & Storage: Supabase (Postgres for chat logs, Storage for audio).

Deployment: Render (using a Web Service for the Next.js app).

2. The "Reply Bot" & Translation Logic
Since you want the translation to appear directly under the original text, your message objects in the database should look like this:

JSON
{
  "id": "uuid",
  "role": "doctor", 
  "sender": "user", // or "bot"
  "original_text": "Hola, ¿cómo estás?",
  "translated_text": "Hello, how are you?",
  "audio_url": "supabase-link.wav",
  "created_at": "timestamp"
}
The Workflow:
User sends message: Save the text to Supabase.

Translate API Call: Send the text to Gemini with a prompt: "Translate this to [Target Language]. Provide ONLY the translation."

Bot Reply: Immediately trigger a second Gemini call.

If User is Patient: "You are a professional Doctor. The patient just said [Translated Text]. Reply in English with a medical follow-up."

If User is Doctor: "You are a patient who is feeling [random symptom]. The doctor said [Translated Text]. Reply in Spanish."

Display: Map through messages and render the original and translated fields in your bubble.

3. UI Design (The "Viber/WhatsApp" Look)
To get that professional messaging feel:

Chat Container: A scrollable area with flex flex-col.

User Bubbles: align-self: flex-end, background color (e.g., #007bff), white text.

Bot Bubbles: align-self: flex-start, background color (e.g., #e9e9eb), black text.

Translation Style: > Hola > <span style="font-size: 0.8rem; opacity: 0.7;">Hello</span>

4. Key Components to Build
A. The "Media Vault" (Top Right Button)
Add a "Paperclip" or "Folder" icon at the top right. When clicked, it opens a Sidebar that filters your Supabase messages table for any row where audio_url is NOT null. This satisfies the requirement to "view voice messages sent."

B. The "Search & Jump"
Add a search bar in the header.

When a user types, query Supabase: SELECT * FROM messages WHERE original_text ILIKE %query%.

On click of a result:

JavaScript
const element = document.getElementById(`msg-${selectedId}`);
element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
element.classList.add('animate-highlight'); // Briefly change background color
C. Audio Transcription
Since Gemini 1.5 can handle audio files directly, you can skip a separate transcription step! You can send the audio file from Supabase directly to Gemini and ask: "Transcribe and then translate this audio into [Language]."