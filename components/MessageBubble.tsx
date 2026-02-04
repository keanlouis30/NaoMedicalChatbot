'use client';

import { Message } from '@/lib/supabase';
import { Play, Image as ImageIcon, Video } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  highlighted?: boolean;
}

export default function MessageBubble({ message, isUser, highlighted }: MessageBubbleProps) {
  const bubbleColor = isUser ? 'bg-purple-500' : 'bg-white/10';
  const textColor = isUser ? 'text-white' : 'text-white';
  const alignment = isUser ? 'ml-auto' : 'mr-auto';

  const renderMedia = () => {
    if (!message.media_url) return null;

    switch (message.media_type) {
      case 'audio':
        return (
          <div className="mt-2 flex items-center gap-2 p-2 bg-black/20 rounded-lg">
            <Play className="h-4 w-4" />
            <audio controls src={message.media_url} className="w-full max-w-xs">
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'image':
        return (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img 
              src={message.media_url} 
              alt="Shared image" 
              className="max-w-xs max-h-64 object-cover rounded-lg"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2 rounded-lg overflow-hidden">
            <video 
              controls 
              src={message.media_url} 
              className="max-w-xs max-h-64 rounded-lg"
            >
              Your browser does not support the video element.
            </video>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`max-w-[70%] ${alignment} transition-all duration-300 ${
        highlighted ? 'animate-pulse bg-yellow-400/20 rounded-2xl p-1' : ''
      }`}
    >
      <div className={`${bubbleColor} ${textColor} rounded-2xl p-4 shadow-lg backdrop-blur-sm`}>
        {/* Sender Label */}
        <div className="text-xs opacity-70 mb-1 font-medium">
          {message.sender === 'user' ? (
            <span className="capitalize">{message.role}</span>
          ) : (
            <span>Bot ({message.role === 'doctor' ? 'Patient' : 'Doctor'})</span>
          )}
        </div>

        {/* Original Text */}
        <div className="text-base font-medium mb-1">
          {message.original_text}
        </div>

        {/* Translated Text */}
        {message.translated_text && message.translated_text !== message.original_text && (
          <div className="text-sm opacity-70 italic mt-1">
            {message.translated_text}
          </div>
        )}

        {/* Media */}
        {renderMedia()}

        {/* Timestamp */}
        <div className="text-xs opacity-50 mt-2">
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
