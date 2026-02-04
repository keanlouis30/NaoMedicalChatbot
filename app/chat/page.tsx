'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Mic, StopCircle, Paperclip, Search, FileText, X, Image as ImageIcon, Video, Folder, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  created_at: string;
  role: 'doctor' | 'patient';
  sender: 'user' | 'bot';
  original_text: string;
  translated_text: string | null;
  media_url: string | null;
  media_type: 'audio' | 'image' | 'video' | null;
}
import MessageBubble from '@/components/MessageBubble';

export default function ChatPage() {
  const [role, setRole] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showMediaVault, setShowMediaVault] = useState(false);
  const [mediaMessages, setMediaMessages] = useState<Message[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') || 'patient';
    const userLanguage = localStorage.getItem('userLanguage') || 'english';
    setRole(userRole);
    setLanguage(userLanguage);
    
    const initializeChat = async () => {
      const stored = localStorage.getItem('chat_messages');
      const storedRole = localStorage.getItem('chat_role'); // Track which role the chat was created for
      
      // Clear messages if role changed
      if (storedRole && storedRole !== userRole) {
        localStorage.removeItem('chat_messages');
        localStorage.setItem('chat_role', userRole);
      } else if (!storedRole) {
        localStorage.setItem('chat_role', userRole);
      }
      
      const messages = localStorage.getItem('chat_messages');
      if (!messages || JSON.parse(messages).length === 0) {
        // First time in chat - if doctor, bot sends first message
        if (userRole === 'doctor') {
          await sendInitialBotMessage(userLanguage);
        }
      }
      
      // Load messages after initial setup
      loadMessages();
      loadMediaMessages();
    };
    
    initializeChat();
  }, []);

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem('chat_messages');
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const saveMessages = (msgs: Message[]) => {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(msgs));
      setMessages(msgs);
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const loadMediaMessages = () => {
    try {
      const stored = localStorage.getItem('chat_messages');
      if (stored) {
        const allMessages = JSON.parse(stored);
        const media = allMessages.filter((msg: Message) => msg.media_url !== null);
        setMediaMessages(media.reverse());
      } else {
        setMediaMessages([]);
      }
    } catch (error) {
      console.error('Error loading media:', error);
      setMediaMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotLanguage = () => {
    return role === 'patient' ? 'English' : 'Spanish';
  };

  const getTargetLanguage = () => {
    return language.charAt(0).toUpperCase() + language.slice(1);
  };

  const sendInitialBotMessage = async (userLanguage: string) => {
    setIsLoading(true);
    try {
      // Bot (patient) speaks in Spanish
      const initialMessage = "Hola doctor, no me siento bien. Tengo dolor de cabeza, fiebre y me siento muy cansado desde hace dos días.";
      
      // Translate to doctor's language
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: initialMessage, 
          targetLanguage: userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)
        })
      });
      
      if (!translateRes.ok) {
        throw new Error('Translation failed');
      }
      
      const { translation } = await translateRes.json();
      console.log('Initial message translation:', translation); // Debug log

      // Create initial bot message
      const botMessage: Message = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        role: 'patient',
        sender: 'bot',
        original_text: initialMessage,
        translated_text: translation || 'Translation unavailable',
        media_url: null,
        media_type: null
      };

      // Save to localStorage
      const msgs = [botMessage];
      saveMessages(msgs);
      console.log('Initial bot message saved:', botMessage); // Debug log
    } catch (error) {
      console.error('Error sending initial bot message:', error);
      
      // Fallback: create message without translation if API fails
      const fallbackMessage: Message = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        role: 'patient',
        sender: 'bot',
        original_text: "Hola doctor, no me siento bien. Tengo dolor de cabeza, fiebre y me siento muy cansado desde hace dos días.",
        translated_text: "Hello doctor, I don't feel well. I have a headache, fever, and have been feeling very tired for two days.",
        media_url: null,
        media_type: null
      };
      saveMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string, mediaUrl?: string, mediaType?: 'audio' | 'image' | 'video') => {
    if (!text && !mediaUrl) return;

    setIsLoading(true);
    try {
      // Translate user's message
      console.log('Translating user message:', text, 'to', getBotLanguage());
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          targetLanguage: getBotLanguage() 
        })
      });
      
      if (!translateRes.ok) {
        const errorText = await translateRes.text();
        console.error('Translation API error:', errorText);
        throw new Error('Translation failed');
      }
      
      const translateData = await translateRes.json();
      const translation = translateData.translation;
      console.log('Translation result:', translation);

      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        role: role as 'doctor' | 'patient',
        sender: 'user',
        original_text: text,
        translated_text: translation,
        media_url: mediaUrl || null,
        media_type: mediaType || null
      };

      // Get bot reply
      console.log('Getting bot reply for translated text:', translation);
      const botReplyRes = await fetch('/api/bot-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translatedText: translation,
          userRole: role,
          botLanguage: getBotLanguage()
        })
      });
      
      if (!botReplyRes.ok) {
        const errorText = await botReplyRes.text();
        console.error('Bot reply API error:', errorText);
        throw new Error('Bot reply failed');
      }
      
      const botReplyData = await botReplyRes.json();
      const botReply = botReplyData.botReply;
      console.log('Bot reply:', botReply);

      // Translate bot reply to user's language
      console.log('Translating bot reply:', botReply, 'to', getTargetLanguage());
      const botTranslateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: botReply,
          targetLanguage: getTargetLanguage()
        })
      });
      
      if (!botTranslateRes.ok) {
        const errorText = await botTranslateRes.text();
        console.error('Bot translation API error:', errorText);
        throw new Error('Bot translation failed');
      }
      
      const botTranslateData = await botTranslateRes.json();
      const botTranslation = botTranslateData.translation;
      console.log('Bot translation:', botTranslation);

      // Create bot message
      const botRole = role === 'patient' ? 'doctor' : 'patient';
      const botMessage: Message = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        role: botRole,
        sender: 'bot',
        original_text: botReply,
        translated_text: botTranslation,
        media_url: null,
        media_type: null
      };

      // Save both messages to localStorage
      const updatedMessages = [...messages, userMessage, botMessage];
      saveMessages(updatedMessages);
      loadMediaMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert audio to base64 data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        
        // Transcribe audio (optional - only if API is working)
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');
          formData.append('targetLanguage', getBotLanguage());

          const transcribeRes = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });
          
          if (transcribeRes.ok) {
            const { original, translation } = await transcribeRes.json();
            await sendMessage(original, base64Url, 'audio');
          } else {
            // If transcription fails, still save the audio
            await sendMessage('Audio message', base64Url, 'audio');
          }
        } catch (transcribeError) {
          console.warn('Transcription failed, saving audio without text:', transcribeError);
          await sendMessage('Audio message', base64Url, 'audio');
        }
        
        setIsLoading(false);
      };

      reader.onerror = () => {
        console.error('Error reading audio file');
        alert('Failed to process audio');
        setIsLoading(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio');
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for localStorage)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large! Please select a file smaller than 5MB.');
      return;
    }

    setIsLoading(true);
    try {
      // Convert file to base64 data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        const mediaType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : null;

        if (mediaType) {
          await sendMessage(`Shared ${mediaType}`, base64Url, mediaType);
        }
        
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.onerror = () => {
        console.error('Error reading file');
        alert('Failed to read file');
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const query = searchQuery.toLowerCase();
      const results = messages.filter(msg => {
        // Skip messages with missing text
        if (!msg || !msg.original_text) return false;
        
        const originalMatch = msg.original_text.toLowerCase().includes(query);
        const translatedMatch = msg.translated_text ? 
          msg.translated_text.toLowerCase().includes(query) : false;
        
        return originalMatch || translatedMatch;
      });
      setSearchResults(results);
      console.log(`Found ${results.length} results for "${searchQuery}"`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const jumpToMessage = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    console.log('Jumping to message:', messageId, 'Element found:', !!element);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 3000);
    } else {
      console.warn('Message element not found:', `msg-${messageId}`);
    }
  };

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const { summary: generatedSummary } = await res.json();
      setSummary(generatedSummary);
      setShowSummary(true);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      localStorage.removeItem('chat_messages');
      setMessages([]);
      setMediaMessages([]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-20 bg-black/30 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/setup">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-white text-sm">
              <span className="font-semibold capitalize">{role}</span> • <span className="capitalize">{language}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={isLoading || messages.length === 0}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSummary}
              disabled={isLoading || messages.length === 0}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Generate Medical Summary"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMediaVault(!showMediaVault)}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Media Vault"
            >
              <Folder className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-6xl mx-auto mt-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button onClick={handleSearch} size="sm" className="bg-purple-500 hover:bg-purple-600">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white/10 backdrop-blur-lg rounded-xl p-2 max-h-32 overflow-y-auto">
              {searchResults.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    jumpToMessage(msg.id);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg text-white text-sm truncate"
                >
                  {msg.original_text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative h-[calc(100vh-180px)] flex">
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.sender === 'user'}
                highlighted={message.id === highlightedMessageId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Media Vault Sidebar */}
        {showMediaVault && (
          <div className="w-80 bg-black/30 backdrop-blur-lg border-l border-white/10 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Media Vault</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaVault(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {mediaMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => jumpToMessage(msg.id)}
                  className="w-full bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-colors"
                >
                  {msg.media_type === 'audio' && (
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Mic className="h-4 w-4" />
                      <span>Audio message</span>
                    </div>
                  )}
                  {msg.media_type === 'image' && (
                    <img src={msg.media_url!} alt="Media" className="w-full h-24 object-cover rounded" />
                  )}
                  {msg.media_type === 'video' && (
                    <div className="relative">
                      <video src={msg.media_url!} className="w-full h-24 object-cover rounded" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-white/70 mt-1">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-20 bg-black/30 backdrop-blur-lg border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`text-white/80 hover:text-white hover:bg-white/10 ${
              isRecording ? 'animate-pulse bg-red-500/20' : ''
            }`}
          >
            {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendText()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <Button
            onClick={handleSendText}
            disabled={isLoading || !inputText.trim()}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Medical Summary</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-white/90 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
