# Nao Medical Chatbot

A full-stack healthcare translation web application that acts as a real-time translation bridge between doctors and patients, featuring AI-powered translation, audio transcription, media sharing, and medical summaries.

## 🌟 Features

### ✅ Completed Features

#### 1. **Landing Page**
- Beautiful animated Silk background from React Bits
- TypeWriter text animation: "Welcome to Nao Medical Chat"
- Modern glassmorphic design with purple gradient theme
- Smooth transitions and hover effects

#### 2. **Role & Language Selection**
- Choose between Patient or Doctor role
- Select preferred language from 6 options:
  - English 🇺🇸
  - Spanish 🇪🇸
  - French 🇫🇷
  - German 🇩🇪
  - Chinese 🇨🇳
  - Arabic 🇸🇦
- Progress indicator showing setup steps
- Selections stored in localStorage

#### 3. **Real-Time Translation Chat**
- Messages show original text and translation side-by-side
- Format: 
  ```
  "Hola"
  "Hello"
  ```
- Auto-scrolls to latest message
- User messages in purple bubbles (right-aligned)
- Bot messages in white/transparent bubbles (left-aligned)

#### 4. **AI Reply Bot**
- Bot automatically responds in its preferred language
- If user is **Patient**: Bot acts as **Doctor** (speaks English)
- If user is **Doctor**: Bot acts as **Patient** (speaks Spanish)
- Contextual medical responses using Gemini AI
- Bot messages are translated to user's language

#### 5. **Audio Recording & Transcription**
- Click microphone icon to start/stop recording
- Audio automatically uploaded to Supabase Storage
- Gemini AI transcribes and translates audio
- Audio playable inline in message bubbles
- Visual recording indicator (pulsing red)

#### 6. **Media Upload (Images & Videos)**
- Click paperclip icon to upload images or videos
- Uploaded media stored in Supabase Storage
- Images displayed inline in chat
- Videos playable with controls
- All media viewable in Media Vault

#### 7. **Media Vault Sidebar**
- Click folder icon to open Media Vault
- Shows all audio, images, and videos from conversation
- Click any media to jump to its message in chat
- Organized chronologically with dates
- Quick preview of images and videos

#### 8. **Search with Jump-to-Message**
- Search bar in header for finding keywords
- Searches both original and translated text
- Click search result to jump to message
- Smooth scroll animation
- Message highlights with pulse effect for 3 seconds
- Search results dropdown shows matching messages

#### 9. **Medical Summary Generation**
- Click document icon in header to generate summary
- Uses Gemini Pro for accurate medical analysis
- Structured summary includes:
  - Chief Complaint
  - Symptoms
  - Diagnosis/Assessment
  - Medications
  - Follow-up Actions
- Modal overlay displays full summary
- Generated from entire conversation history

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Bits** (Silk background component)
- **GSAP** (TextType animations)
- **shadcn/ui** (UI components)
- **Lucide React** (Icons)

### Backend
- **Next.js API Routes**
- **Supabase** (Database & Storage)
- **Google Gemini AI**
  - `gemini-1.5-flash` for translation & chat
  - `gemini-1.5-pro` for medical summaries

### Data Storage
- **localStorage** for chat messages (fresh each session)
- **Supabase Storage** for media files (audio, images, videos)
- No database needed for messages - everything stored client-side
- Each browser session starts fresh

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Google Gemini API key

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NaoMedicalChatbot.git
   cd NaoMedicalChatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase (only needed for media storage)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase Storage** (Optional - only if using media features)
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create storage bucket for media
   insert into storage.buckets (id, name, public) values ('media', 'media', true);

   -- Storage policies
   create policy "Public Access" on storage.objects for select using ( bucket_id = 'media' );
   create policy "Public Insert" on storage.objects for insert with check ( bucket_id = 'media' );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Starting a Conversation

1. **Landing Page**: Click "Test" button
2. **Select Role**: Choose Patient or Doctor
3. **Select Language**: Pick your preferred language
4. **Start Chat**: Click "Start Chat" button

### Sending Messages

- **Text**: Type in the input field and press Enter or click Send
- **Audio**: Click microphone icon, speak, then click stop icon
- **Media**: Click paperclip icon to upload images or videos

### Features in Chat

- **Search**: Use search bar to find specific keywords in conversation
- **Media Vault**: Click folder icon to view all media
- **Summary**: Click document icon to generate medical summary
- **Clear Chat**: Click trash icon to start a fresh conversation
- **Jump to Message**: Click search results or media vault items to navigate

## 🏗️ Project Structure

```
NaoMedicalChatbot/
├── app/
│   ├── api/
│   │   ├── bot-reply/route.ts      # Bot response generation
│   │   ├── summary/route.ts         # Medical summary generation
│   │   ├── transcribe/route.ts      # Audio transcription
│   │   └── translate/route.ts       # Text translation
│   ├── chat/
│   │   └── page.tsx                 # Main chat interface
│   ├── setup/
│   │   └── page.tsx                 # Role & language selection
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── MessageBubble.tsx            # Chat message component
│   ├── Silk.jsx                     # Silk background
│   ├── TextType.tsx                 # TypeWriter animation
│   └── TextType.css                 # TextType styles
├── lib/
│   ├── supabase.ts                  # Supabase client
│   └── utils.ts                     # Utility functions
├── .env.local.example               # Environment variables template
├── README.md                        # This file
└── package.json                     # Dependencies
```

## 🎨 Design Features

- **Glassmorphism UI**: Modern transparent glass effect with backdrop blur
- **Purple Gradient Theme**: Consistent purple/slate color scheme
- **Smooth Animations**: GSAP-powered text animations, smooth scrolls, transitions
- **Responsive Design**: Mobile-friendly layout
- **Accessibility**: Proper ARIA labels, keyboard navigation support

## 🔒 Security Considerations

⚠️ **Important**: This is a demo application with simplified security for development purposes.

For production deployment:
- Implement proper authentication (Supabase Auth)
- Add Row Level Security policies based on user IDs
- Restrict storage bucket access
- Add rate limiting to API routes
- Validate and sanitize all inputs
- Use HTTPS only
- Add CORS restrictions

## 🚀 Deployment

### Recommended: Render.com

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Add environment variables in Render dashboard
4. Deploy!

### Alternative: Vercel

```bash
vercel --prod
```

## 🧪 Testing

Start the development server and test:

1. ✅ Landing page animation loads smoothly
2. ✅ Role selection saves to localStorage
3. ✅ Messages are translated correctly
4. ✅ Bot replies in correct language
5. ✅ Audio recording and transcription works
6. ✅ Images and videos upload successfully
7. ✅ Search finds and highlights messages
8. ✅ Media vault displays all media
9. ✅ Summary generates properly

## 📝 Known Limitations

- No user authentication (demo purposes)
- Messages stored in browser localStorage (cleared on browser data clear)
- Each browser session is independent (no cross-device sync)
- Public storage bucket (all media is publicly accessible)
- No message editing (but can clear entire chat)
- Audio format limited to WebM (browser-dependent)
- No conversation history between sessions

## 🤝 AI Tools Used

- **Warp AI Agent**: Full implementation and code generation
- **Google Gemini 1.5 Flash**: Translation and chat responses
- **Google Gemini 1.5 Pro**: Medical summary generation
- **React Bits**: Pre-built animated UI components

## 📄 License

MIT License - feel free to use this project for learning or building your own applications.

## 🙏 Acknowledgments

- [React Bits](https://reactbits.dev) for beautiful animated components
- [shadcn/ui](https://ui.shadcn.com) for excellent UI components
- [Supabase](https://supabase.com) for backend infrastructure
- [Google Gemini](https://ai.google.dev) for AI capabilities
- [Next.js](https://nextjs.org) for the amazing framework
