'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserRound, Stethoscope, Check } from 'lucide-react';

type Role = 'patient' | 'doctor' | null;
type Language = 'english' | 'spanish' | 'french' | 'german' | 'chinese' | 'arabic' | null;

const languages = [
  { id: 'english', name: 'English', flag: '🇺🇸' },
  { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { id: 'french', name: 'French', flag: '🇫🇷' },
  { id: 'german', name: 'German', flag: '🇩🇪' },
  { id: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  { id: 'arabic', name: 'Arabic', flag: '🇸🇦' },
];

export default function SetupPage() {
  const [role, setRole] = useState<Role>(null);
  const [language, setLanguage] = useState<Language>(null);
  const [step, setStep] = useState<'role' | 'language'>('role');

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setTimeout(() => setStep('language'), 300);
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
  };

  const handleStart = () => {
    // Store selections in localStorage or state management
    if (role && language) {
      localStorage.setItem('userRole', role);
      localStorage.setItem('userLanguage', language);
      // Navigate to chat page (to be created)
      window.location.href = '/chat';
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent"></div>

      <div className="relative z-10 min-h-screen px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button 
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-12 flex items-center justify-center gap-3">
            <div className={`h-2 w-16 rounded-full transition-all duration-300 ${step === 'role' || role ? 'bg-purple-400' : 'bg-white/20'}`}></div>
            <div className={`h-2 w-16 rounded-full transition-all duration-300 ${step === 'language' ? 'bg-purple-400' : 'bg-white/20'}`}></div>
          </div>

          {/* Role Selection */}
          {step === 'role' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Select Your Role
                </h1>
                <p className="text-lg text-white/70">
                  Choose how you'll be using Nao Medical Chat
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Patient Option */}
                <button
                  onClick={() => handleRoleSelect('patient')}
                  className={`group relative p-8 rounded-3xl bg-white/10 backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:bg-white/15 ${
                    role === 'patient' ? 'border-purple-400 bg-white/20' : 'border-white/20 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-6 rounded-2xl transition-all duration-300 ${
                      role === 'patient' ? 'bg-purple-400' : 'bg-white/20 group-hover:bg-purple-400/80'
                    }`}>
                      <UserRound className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Patient</h3>
                    <p className="text-white/70 text-center">
                      I'm seeking medical assistance
                    </p>
                  </div>
                  {role === 'patient' && (
                    <div className="absolute top-4 right-4 bg-purple-400 rounded-full p-1">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </button>

                {/* Doctor Option */}
                <button
                  onClick={() => handleRoleSelect('doctor')}
                  className={`group relative p-8 rounded-3xl bg-white/10 backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:bg-white/15 ${
                    role === 'doctor' ? 'border-purple-400 bg-white/20' : 'border-white/20 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-6 rounded-2xl transition-all duration-300 ${
                      role === 'doctor' ? 'bg-purple-400' : 'bg-white/20 group-hover:bg-purple-400/80'
                    }`}>
                      <Stethoscope className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Doctor</h3>
                    <p className="text-white/70 text-center">
                      I'm providing medical care
                    </p>
                  </div>
                  {role === 'doctor' && (
                    <div className="absolute top-4 right-4 bg-purple-400 rounded-full p-1">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Language Selection */}
          {step === 'language' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Select Your Language
                </h1>
                <p className="text-lg text-white/70">
                  Choose your preferred language for communication
                </p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageSelect(lang.id as Language)}
                    className={`group relative p-6 rounded-2xl bg-white/10 backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:bg-white/15 ${
                      language === lang.id ? 'border-purple-400 bg-white/20' : 'border-white/20 hover:border-purple-400/50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <span className="text-5xl">{lang.flag}</span>
                      <h3 className="text-xl font-semibold text-white">{lang.name}</h3>
                    </div>
                    {language === lang.id && (
                      <div className="absolute top-3 right-3 bg-purple-400 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Start Button */}
              <div className="flex justify-center mt-12">
                <Button
                  onClick={handleStart}
                  disabled={!language}
                  size="lg"
                  className={`text-xl px-12 py-7 font-semibold rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 ${
                    language
                      ? 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105 hover:shadow-purple-500/50'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }`}
                >
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
