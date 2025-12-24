"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Trash2, Calendar, User } from "lucide-react";

interface Suggestion {
  id: string;
  text: string;
  user: string;
  userId: string | null;
  timestamp: string;
}

export default function SuggestionsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadSuggestions();
  }, [router]);

  const loadSuggestions = () => {
    const saved = localStorage.getItem("game_suggestions");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sort by timestamp, newest first
      parsed.sort((a: Suggestion, b: Suggestion) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setSuggestions(parsed);
    }
  };

  const deleteSuggestion = (id: string) => {
    if (!confirm("Are you sure you want to delete this suggestion?")) return;
    
    const updated = suggestions.filter(s => s.id !== id);
    localStorage.setItem("game_suggestions", JSON.stringify(updated));
    setSuggestions(updated);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 page-enter">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-cyan-400 active:opacity-80 mb-4 sm:mb-8 font-semibold neon-glow-cyan min-h-[44px] animate-fade-in-left hover:animate-pulse-glow"
        >
          <ArrowLeft className="w-5 h-5 animate-fade-in-right" />
          <span className="text-sm sm:text-base">BACK TO GAMES</span>
        </Link>

        <div className="text-center mb-6 sm:mb-12 animate-fade-in-down delay-200">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-5xl font-bold text-cyan-400 neon-glow-cyan mb-2 sm:mb-4 text-3d float-3d animate-glow-pulse">
            SUGGESTIONS
          </h1>
          <p className="text-sm sm:text-base text-cyan-300 animate-fade-in-up delay-300">
            View all submitted suggestions
          </p>
        </div>

        {suggestions.length === 0 ? (
          <div className="neon-card neon-box-cyan p-8 text-center card-3d animate-slide-fade-in">
            <MessageSquare className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <p className="text-cyan-300 text-lg">No suggestions yet!</p>
            <p className="text-cyan-300/70 text-sm mt-2">
              Be the first to share your ideas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="neon-card neon-box-cyan p-4 sm:p-6 card-3d animate-slide-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 font-bold text-sm sm:text-base">
                        {suggestion.user}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300/70 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatDate(suggestion.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSuggestion(suggestion.id)}
                    className="neon-btn neon-btn-red px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1 btn-3d hover:animate-shake min-h-[32px]"
                    title="Delete suggestion"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">DELETE</span>
                  </button>
                </div>
                <p className="text-cyan-200 text-sm sm:text-base whitespace-pre-wrap">
                  {suggestion.text}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/games"
            className="neon-btn neon-btn-purple px-6 py-3 text-sm sm:text-base font-bold btn-3d hover:animate-pulse-glow inline-flex items-center gap-2 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            SUBMIT NEW SUGGESTION
          </Link>
        </div>
      </div>
    </div>
  );
}











