"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, X, Zap, Waves, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { menuItems, MenuItem } from "../data/menuData";

// Initial items for visual fallback logic
const initialItems = menuItems;

/**
 * Marketing Avatar - Concierge with Video-Based Transitions & High-Fidelity Audio
 */
export function MarketingAvatar() {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Live Stream Ready");
  const [lastResponse, setLastResponse] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [detectedLang, setDetectedLang] = useState("ENGLISH (EN)");
  const [currentLang, setCurrentLang] = useState('en-US');

  // Video State
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isVideoUnmuted, setIsVideoUnmuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const startRecognitionRef = useRef<() => void>(() => {});
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const poseImage = "/images/marketing_host.png"; // Fallback static frame

  // --- VIDEO HANDLER ---
  const triggerVideo = useCallback((src: string, unmuted = false, loop = false) => {
    setCurrentVideo(src);
    setIsVideoUnmuted(unmuted);
    // Note: Video tag handles loop via autoPlay and state end handlers
  }, []);

  const onVideoEnd = () => {
    setCurrentVideo(null); // Fallback back to poseImage
  };

  // --- MEDIA CAPTURE (Visual HUD) ---
  const stopMediaCapture = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  }, []);

  const startMediaCapture = useCallback(async () => {
    stopMediaCapture();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      audioContextRef.current.createMediaStreamSource(stream).connect(analyzerRef.current);
      analyzerRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      const update = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        setAudioLevel(avg / 128);
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.warn("Media capture denied:", err);
    }
  }, [stopMediaCapture]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  }, []);

  const getGeminiVoice = (isSpanish: boolean) => {
    const voices = window.speechSynthesis.getVoices();
    if (isSpanish) {
      return voices.find(v => v.name.includes("Monica") || v.lang.startsWith("es")) || voices.find(v => v.lang.startsWith("es")) || voices[0];
    }
    return voices.find(v => v.name.includes("Ava") || v.name.includes("Samantha") || v.lang.startsWith("en")) || voices.find(v => v.lang.startsWith("en")) || voices[0];
  };

  const speakResponse = useCallback((text: string, isSpanish: boolean, tone: 'excited' | 'neutral' = 'neutral') => {
    // ⚔️ SECURITY/CONCURRENCY: Silence mic and previous speech
    stopRecognition();
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/\[.*\]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isSpanish ? "es-ES" : "en-US";
    utterance.rate = tone === 'excited' ? 1.05 : 0.92;
    utterance.pitch = tone === 'excited' ? 1.1 : 1.0;

    utterance.onstart = () => {
      setIsAgentSpeaking(true);
      setStatus(isSpanish ? "Guía Visual Activa" : "Visual Guidance Active");
      triggerVideo("/videos/point_right.mp4", false, true);
    };

    utterance.onend = () => {
      setIsAgentSpeaking(false);
      setCurrentVideo(null);
      setStatus(isSpanish ? "Listo para Escuchar" : "Live Stream Ready");
      if (isActive && !isMuted) {
        setTimeout(() => {
          startRecognitionRef.current();
        }, 500);
      }
    };

    const voice = getGeminiVoice(isSpanish);
    if (voice) utterance.voice = voice;
    
    // --- STAGE 2: LIVE API OVERRIDE (CHIRP 3) ---
    // Always use high-fidelity live API (Chirp 3) for BOTH English and Spanish if available.
    setStatus(isSpanish ? "Generando Audio de Alta Fidelidad..." : "Generating High-Fidelity Audio...");
    
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: cleanText, 
        style: tone === 'excited' ? 'warm_welcome' : 'friendly_server',
        lang: isSpanish ? "es-ES" : "en-US"
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.audio_url) {
        const audio = new Audio(`/api${data.audio_url}`);
        audio.onplay = () => {
          stopRecognition(); // Double-ensure mic is off
          setIsAgentSpeaking(true);
          setStatus(isSpanish ? "Guía Visual Activa" : "Visual Guidance Active");
          triggerVideo("/videos/point_right.mp4", false, true);
          
          const match = text.match(/id: (\d+)/);
          if (match) {
            window.dispatchEvent(new CustomEvent('menu-highlight', { detail: match[1] }));
          }
        };
        audio.onended = () => {
          setIsAgentSpeaking(false);
          setCurrentVideo(null);
          setStatus(isSpanish ? "Listo para Escuchar" : "Live Stream Ready");
          if (isActive && !isMuted) {
            setTimeout(() => startRecognitionRef.current(), 500);
          }
        };
        audio.play().catch(() => window.speechSynthesis.speak(utterance));
      } else {
        window.speechSynthesis.speak(utterance);
      }
    })
    .catch(() => window.speechSynthesis.speak(utterance));

  }, [isActive, isMuted, triggerVideo, stopRecognition]);

  // --- MULTIMODAL REASONING ENGINE ---
  const processMultimodalRequest = useCallback(() => {
    stopRecognition();
    setIsThinking(true);
    setStatus("Contextual Analysis...");
    
    const transcript = transcriptRef.current.toLowerCase();
    const isSpanish = /hola|tienes|quiero|opciones|huevos|compras|que|ques|cuanto|menu|plato|recomienda|precio|costo|hora|abierto|cerrado|pescado|mariscos|quien|chef|español|patatas|papas|estofado|sopa|cangrejo|arroz|pan|tazon/.test(transcript);
    
    setCurrentLang(isSpanish ? 'es-ES' : 'en-US');
    setDetectedLang(isSpanish ? "SPANISH (ES)" : "ENGLISH (EN)");

    let response = "";
    let tone: 'excited' | 'neutral' = 'neutral';
    
    // --- SCOPE GUARDRAILS ---
    const outOfScopeKeywords = ['weather', 'bitcoin', 'crypto', 'nfl', 'election', 'clima', 'fútbol', 'politica', 'how do i', 'como hago'];
    const isOutOfScope = outOfScopeKeywords.some(k => transcript.includes(k));

    if (isOutOfScope) {
      if (isSpanish) {
         response = "Como tu Concierge Digital del Golden Gate Bistro, mi conocimiento se enfoca en nuestra cocina de Pier 39 y Chef Marco Rossi. ¿Te gustaría saber sobre nuestro famoso Cioppino o Fish & Chips?";
      } else {
         response = "As your Golden Gate Bistro Concierge, my expertise is purely culinary! I'm here to tell you about Pier 39's best seafood. Shall we discuss our Wharf Cioppino instead?";
      }
    } else {
      if (isSpanish) {
        if (transcript.includes("chef") || transcript.includes("marco")) {
          response = "Nuestro Chef Ejecutivo es Marco Rossi, un maestro de los mariscos de San Francisco. ¡Es un apasionado del cangrejo Dungeness fresco!";
        } else if (transcript.includes("hora") || transcript.includes("abierto") || transcript.includes("cerrado")) {
          response = "El Golden Gate Bistro recibe a sus clientes todos los días de 11:00 AM a 10:00 PM aquí en el Pier 39.";
        } else if (transcript.includes("chowder") || transcript.includes("sopa")) {
          response = "¡Nuestro Signature Wharf Sourdough Chowder es espectacular y cuesta $18.00! Se sirve en un tazón de pan recién horneado. [A2UI_POINT, id: 1]";
          tone = 'excited';
        } else if (transcript.includes("crab") || transcript.includes("cangrejo") || transcript.includes("huevos")) {
          response = "El Chef Marco recomienda los Huevos Rellenos de Cangrejo Dungeness por $21.00. [A2UI_POINT, id: 2]";
          tone = 'excited';
        }
 else if (transcript.includes("cioppino") || transcript.includes("estofado")) {
          response = "El Wharf Cioppino es nuestra joya: un estofado robusto de cangrejo y mariscos por $42.00. [A2UI_POINT, id: 3]";
          tone = 'excited';
        } else if (transcript.includes("fish") || transcript.includes("chips") || transcript.includes("patatas") || transcript.includes("papas")) {
          response = "Nuestros Fish & Chips se sirven con deliciosas patatas fritas y cuestan $28.00. [A2UI_POINT, id: 4]";
        } else if (transcript.includes("postre") || transcript.includes("pudding") || transcript.includes("bread")) {
          response = "¡No te pierdas el Sourdough Bread Pudding con chocolate Ghirardelli por $14.00! [A2UI_POINT, id: 5]";
          tone = 'excited';
        } else if (transcript.includes("precio") || transcript.includes("costo") || transcript.includes("cuanto")) {
          response = "Nuestros platos de entrada comienzan en $18.00, y platos principales premium como el Cioppino están en $42.00.";
        } else if (transcript.includes("pagar") || transcript.includes("cuenta") || transcript.includes("checkout")) {
          response = "¡Excelente elección! Puedes completar tu pago de forma segura usando el Asistente de Chat a mi derecha. Solo di 'pagar' allí.";
        } else if (transcript.trim().length > 0) {
          response = "Perdón, no capté eso bien. Pero ya que estás en el Wharf, ¿has probado nuestro famoso Chowder de Sourdough? ¡Es el favorito de Pier 39!";
        }
      } else {
        if (transcript.includes("chef") || transcript.includes("marco")) {
          response = "Our Executive Chef is Marco Rossi, a master of San Francisco seafood. He's incredibly passionate about fresh Dungeness crab!";
        } else if (transcript.includes("hour") || transcript.includes("open") || transcript.includes("close")) {
          response = "The Golden Gate Bistro welcomes guests daily from 11:00 AM to 10:00 PM at Pier 39.";
        } else if (transcript.includes("chowder") || transcript.includes("soup")) {
          response = "Our Signature Wharf Sourdough Chowder is legendary at $18.00! It is served in a fresh-baked house-made sourdough bowl. [A2UI_POINT, id: 1]";
          tone = 'excited';
        } else if (transcript.includes("crab") || transcript.includes("dungeness")) {
          response = "The Dungeness Crab Deviled Eggs are $21.00 and are highly recommended by Chef Marco. [A2UI_POINT, id: 2]";
          tone = 'excited';
        } else if (transcript.includes("cioppino") || transcript.includes("stew")) {
          response = "The Wharf Cioppino is a robust stew of Dungeness crab and scallops for $42.00. It's our absolute masterpiece! [A2UI_POINT, id: 3]";
          tone = 'excited';
        } else if (transcript.includes("fish") || transcript.includes("chips") || transcript.includes("fries") || transcript.includes("potatoes")) {
          response = "Our Anchor Steam Beer-Battered Fish & Chips are local rockfish served with truffle-parmesan fries for $28.00. [A2UI_POINT, id: 4]";
        } else if (transcript.includes("dessert") || transcript.includes("pudding") || transcript.includes("bread")) {
          response = "You must try the Ghirardelli Sourdough Bread Pudding for $14.00. It's pure indulgence! [A2UI_POINT, id: 5]";
          tone = 'excited';
        } else if (transcript.includes("price") || transcript.includes("cost") || transcript.includes("much")) {
          response = "Our famous Wharf starters begin at $18.00, while premium entrees like the Cioppino are $42.00.";
        } else if (transcript.includes("pay") || transcript.includes("check") || transcript.includes("checkout") || transcript.includes("buy")) {
          response = "I'd be happy to help! To complete your secure transaction, please use the Chat Assistant on my right. Just type 'pay' there and I'll handle the rest.";
        } else if (transcript.trim().length > 0) {
          const randomItem = initialItems[Math.floor(Math.random() * initialItems.length)];
          response = `I didn't quite catch that, but since you're here at the Wharf, have you tried our ${randomItem.name}? It's a local favorite!`;
        }
      }
    }

    setTimeout(() => {
      if (!transcript) {
        setIsThinking(false);
        return;
      }
      setLastResponse(response);
      setIsThinking(false);
      setUserTranscript("");
      transcriptRef.current = "";
      speakResponse(response, isSpanish, tone);
    }, 1200);
  }, [speakResponse, stopRecognition]);

  // --- SPEECH RECOGNITION LIFESTYLE ---
  const startRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("[Concierge] SpeechRecognition not supported in this browser.");
      return;
    }

    // Clean up old instance if it exists
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = true;
    recognition.lang = currentLang;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interim += event.results[i][0].transcript;
      }
      const text = interim.trim();
      if (text) {
        setUserTranscript(text);
        transcriptRef.current = text;
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (isActive && !isMuted) {
             recognition.stop();
          }
        }, 2400);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("[Concierge] Speech recognition error:", event.error);
      if (event.error === 'no-speech') return;
    };

    recognition.onend = () => {
      setTimeout(() => {
        if (!isActive || isMuted || isAgentSpeaking || isThinking) return;
        
        if (transcriptRef.current.trim().length > 0) {
          processMultimodalRequest();
        } else {
          try { recognition.start(); } catch(e) {}
        }
      }, 300);
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (err) {
      console.error("[Concierge] Failed to start recognition:", err);
    }
  }, [isActive, isMuted, currentLang, processMultimodalRequest]);

  // Sync ref
  useEffect(() => {
    startRecognitionRef.current = startRecognition;
  }, [startRecognition]);

  // --- PRIMARY LIFECYCLES ---
  useEffect(() => {
    if (isActive && !isMuted) {
      startMediaCapture(); // Keep media capture alive for the visual HUD
      if (!isAgentSpeaking && !isThinking) {
        startRecognition();
      } else {
        stopRecognition();
      }
    } else {
      stopMediaCapture();
      stopRecognition();
    }
    return () => {
      stopMediaCapture();
      stopRecognition();
    };
  }, [isActive, isMuted, isAgentSpeaking, isThinking, currentLang, startMediaCapture, stopMediaCapture, stopRecognition]);

  const handleActivate = () => {
    setIsActive(true);
    triggerVideo("/videos/greeting.mp4", true, false); // UNMUTED greeting
  };

  return (
    <div className="fixed bottom-8 left-8 z-[100]">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-[400px] h-[600px] bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* AVATAR VIEWPORT */}
            <div className="relative h-[65%] bg-black overflow-hidden">
              {isVideoOn ? (
                <div className="w-full h-full relative">
                  {currentVideo ? (
                    <video 
                      ref={videoRef}
                      src={currentVideo}
                      className="w-full h-full object-cover"
                      onEnded={onVideoEnd}
                      autoPlay
                      muted={!isVideoUnmuted}
                      playsInline
                    />
                  ) : (
                    <img 
                      src={poseImage}
                      className="w-full h-full object-cover brightness-110"
                      alt="Digital Host"
                    />
                  )}
                  
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <div className={`w-2 h-2 rounded-full ${isAgentSpeaking ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-[10px] text-white font-bold tracking-widest uppercase">Concierge</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                     <div className="bg-ocean/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white border border-white/10 uppercase font-bold">
                        {detectedLang}
                     </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-white/20" />
                </div>
              )}
            </div>

            {/* DIALOGUE HUD */}
            <div className="flex-1 p-6 flex flex-col bg-slate-950 border-t border-white/10">
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] text-gold uppercase tracking-[0.2em] font-extrabold flex items-center gap-2">
                  <Waves className="w-3 h-3" /> {detectedLang.includes("SPANISH") ? "Guía Visual Activa" : "Visual Guidance Active"}
                </p>

                <div className={`p-3 rounded-xl border ${userTranscript ? 'bg-white/5 border-gold/30' : 'bg-transparent border-white/5 opacity-40'}`}>
                  <p className="text-xs text-white/80 italic font-medium">
                    {userTranscript || (detectedLang.includes("SPANISH") ? "Escuchando consultas culinarias..." : "Listening for culinary questions...")}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {lastResponse && (
                    <motion.div 
                      key={lastResponse}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-xl bg-gold/10 border border-gold/20"
                    >
                      <p className="text-sm text-white font-outfit leading-relaxed">
                        {lastResponse.replace(/\[.*\]/g, "")}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-all relative ${isMuted ? 'bg-red-500' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {!isMuted && audioLevel > 0.05 && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2 + audioLevel, opacity: 0.4 }}
                        className="absolute inset-0 bg-gold rounded-full"
                      />
                    )}
                    {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                  </button>
                  
                  {!isMuted && (
                    <div className="flex gap-1 items-end h-4">
                      {[1, 2, 3, 4, 1].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: isActive && !isMuted ? Math.max(4, h * 12 * audioLevel) : 4 }}
                          className="w-1 bg-gold rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                  >
                    {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
                  </button>
                  <button 
                    onClick={() => setIsActive(false)}
                    className="p-3 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-500 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isActive ? undefined : handleActivate}
        className={`bg-slate-900 border border-white/10 p-5 rounded-full shadow-2xl premium-shadow flex items-center gap-3 group relative overflow-hidden transition-all ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform" />
        <div className="relative">
          <Sparkles className="w-6 h-6 text-gold animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-slate-900" />
        </div>
        <span className="font-outfit font-bold text-white tracking-wide relative z-10">
          Concierge launch
        </span>
      </motion.button>
    </div>
  );
}
