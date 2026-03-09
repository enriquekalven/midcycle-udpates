"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Edit2, Check, X, ShieldAlert, Waves } from "lucide-react";
import { menuItems as initialItems, MenuItem } from "./data/menuData";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAssistant } from "./components/ChatAssistant";
import { MarketingAvatar } from "./components/MarketingAvatar";

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const handleHighlight = (e: any) => {
      const id = e.detail;
      setHighlightedId(id);
      
      // Visual Guidance: Scroll the highlighted item into the center of the screen
      setTimeout(() => {
        const element = document.getElementById(`menu-card-${id}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);

      setTimeout(() => setHighlightedId(null), 8000);
    };
    window.addEventListener('menu-highlight', handleHighlight);
    return () => window.removeEventListener('menu-highlight', handleHighlight);
  }, []);
  const [reviewMode, setReviewMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qcResults, setQcResults] = useState<{ id: string; error: string }[]>([]);

  // Text-To-Speech function: Prioritize Chirp 3 Audio URLs
  const speak = (text: string, audioUrl?: string) => {
    // Stop any existing synthesis
    window.speechSynthesis.cancel();

    if (audioUrl) {
      console.log(`[Audio] Playing high-fidelity Chirp 3 audio: ${audioUrl}`);
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.warn("Chirp audio playback failed, falling back to browser TTS", err);
        fallbackSpeak(text);
      });
      return;
    }

    fallbackSpeak(text);
  };

  const fallbackSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Ava") || v.name.includes("Victoria")) ||
                           voices.find(v => v.name.includes("Google US English") && v.name.includes("Female")) ||
                           voices.find(v => (v.name.includes("Google") || v.name.includes("English (United States)")) && v.lang.startsWith("en")) ||
                           voices.find(v => v.lang.startsWith("en"));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Auto-QC script
  const runQC = () => {
    const errors: { id: string; error: string }[] = [];
    items.forEach((item) => {
      if (item.description.length > 200) {
        errors.push({ id: item.id, error: "Text exceeds 200 characters." });
      }
      if (!item.description.toLowerCase().includes("sourdough") && 
          !item.description.toLowerCase().includes("crab") &&
          !item.description.toLowerCase().includes("fish") &&
          !item.description.toLowerCase().includes("seafood")) {
        errors.push({ id: item.id, error: "Might contain non-restaurant content." });
      }
    });
    setQcResults(errors);
    return errors.length === 0;
  };

  const handleUpdate = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Header */}
      <header className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-ocean">
        <div className="absolute inset-0 opacity-20">
          <Waves className="w-full h-full scale-150 animate-pulse text-gold" />
        </div>
        <div className="relative text-center z-10 p-6 glass rounded-2xl">
          <h1 className="text-5xl md:text-7xl font-playfair text-foreground mb-4">
            The Golden Gate Bistro
          </h1>
          <p className="text-xl font-outfit uppercase tracking-widest text-gold">
            Fisherman's Wharf | San Francisco
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="sticky top-0 z-50 flex justify-center py-6 glass mb-10 gap-4">
        <button
          onClick={() => setReviewMode(!reviewMode)}
          className={`px-6 py-2 rounded-full font-outfit transition-all flex items-center gap-2 ${
            reviewMode ? "bg-gold text-white" : "bg-white text-ocean border border-gold"
          }`}
        >
          {reviewMode ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          {reviewMode ? "Exit Review Mode" : "Enter Review Mode"}
        </button>
        {reviewMode && (
          <button
            onClick={() => runQC()}
            className="px-6 py-2 rounded-full bg-ocean text-white font-outfit flex items-center gap-2 hover:bg-opacity-90 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            Run Auto-QC
          </button>
        )}
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              layout
              key={item.id}
              id={`menu-card-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: highlightedId === item.id ? 1.08 : 1,
                boxShadow: highlightedId === item.id 
                  ? "0 0 60px rgba(184, 134, 11, 0.6)" 
                  : "0 10px 30px -15px rgba(2, 48, 71, 0.3)"
              }}
              className={`glass rounded-3xl overflow-hidden premium-shadow group border transition-all duration-700 ${
                highlightedId === item.id ? 'border-gold ring-4 ring-gold/30 z-20' : 'border-opacity-10 border-ocean'
              }`}
            >
              <div className="relative h-64 w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-gold text-white px-4 py-1 rounded-full text-xs font-outfit">
                  {item.category}
                </div>
                <button
                  onClick={() => speak(`${item.name}. ${item.description}`, item.audio_url)}
                  aria-label={`Play description for ${item.name}`}
                  className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full hover:bg-gold hover:text-white transition-all shadow-lg"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-playfair text-ocean flex-1">
                    {item.name}
                  </h3>
                  <span className="text-xl font-outfit text-gold ml-4">{item.price}</span>
                </div>

                {editingId === item.id ? (
                  <div className="space-y-4">
                    <textarea
                      autoFocus
                      className="w-full p-4 rounded-xl border border-gold focus:ring-2 focus:ring-gold outline-none h-32 text-sm font-outfit bg-white/50"
                      value={item.description}
                      onChange={(e) => handleUpdate(item.id, { description: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-outfit flex-1"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="text-sm font-outfit leading-relaxed opacity-80 min-h-[4rem]">
                      {item.description}
                    </p>
                    {reviewMode && (
                      <button
                        onClick={() => setEditingId(item.id)}
                        aria-label={`Edit description for ${item.name}`}
                        className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-md hover:bg-gold hover:text-white transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* QC Warning */}
                {qcResults.find((r) => r.id === item.id) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                    {qcResults.find((r) => r.id === item.id)?.error}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="mt-20 text-center text-ocean opacity-50 font-outfit p-10 border-t border-ocean border-opacity-10">
        <p>© 2026 The Golden Gate Bistro. All Rights Reserved.</p>
      </footer>

      <ChatAssistant />
      <MarketingAvatar />
    </main>
  );
}
