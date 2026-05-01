export const getBestVoice = async (lang: string): Promise<SpeechSynthesisVoice | null> => {
  let voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    await new Promise<void>(resolve => {
      const handleVoices = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
        resolve();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
      setTimeout(resolve, 1000);
    });
    voices = window.speechSynthesis.getVoices();
  }
  
  const langPrefix = lang.split('-')[0].toLowerCase();
  const matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
  
  if (matchingVoices.length === 0) return null;
  
  // Prioritize premium/natural OS neural voice engines (e.g. Google voices in Chrome)
  const naturalRegex = /(natural|online|premium|neural|google)/i;
  const bestVoice = matchingVoices.find(v => naturalRegex.test(v.name));
  
  return bestVoice || matchingVoices[0];
};

let currentAudio: HTMLAudioElement | null = null;
let currentInterval: any = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _globalUtterance: SpeechSynthesisUtterance | null = null; // GC prevention


export const playNaturalAudio = async (
  text: string, 
  lang: string, 
  onStart?: () => void, 
  onBoundary?: (progress: number) => void, 
  onEnd?: () => void
) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  window.speechSynthesis?.cancel();

  let hasFallenBack = false;
  const triggerFallback = () => {
    if (hasFallenBack) return;
    hasFallenBack = true;
    if (currentInterval) clearInterval(currentInterval);
    fallbackToWebSpeech(text, lang, onStart, onBoundary, onEnd);
  };

  try {
    const tl = lang.split('-')[0].toLowerCase();
    const gtxUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${tl}&client=tw-ob`;
    const audio = new Audio(gtxUrl);
    currentAudio = audio;
    
    if (onStart) audio.onplay = onStart;
    
    if (onBoundary) {
      currentInterval = setInterval(() => {
        if (audio.duration && audio.currentTime) {
          onBoundary((audio.currentTime / audio.duration) * 100);
        }
      }, 50);
    }

    audio.onended = () => {
      if (currentInterval) clearInterval(currentInterval);
      if (onBoundary) onBoundary(100);
      if (onEnd) onEnd();
    };

    audio.onerror = triggerFallback;
    
    await audio.play();
  } catch(err) {
    console.warn("TTS stream failed, falling back to OS TTS", err);
    triggerFallback();
  }
};

const fallbackToWebSpeech = async (
  text: string, 
  lang: string, 
  onStart?: () => void, 
  onBoundary?: (progress: number) => void, 
  onEnd?: () => void
) => {
  const synth = window.speechSynthesis;
  if (!synth) {
    if (onEnd) onEnd();
    return;
  }
  
  synth.cancel();
  
  const bestVoice = await getBestVoice(lang);
  const utterance = new SpeechSynthesisUtterance(text);
  _globalUtterance = utterance; // Prevent GC bug
  void _globalUtterance;
  utterance.lang = lang;
  
  if (bestVoice) {
    utterance.voice = bestVoice;
  }
  
  utterance.onstart = () => { if (onStart) onStart(); };
  utterance.onboundary = (e) => { 
    if (onBoundary) onBoundary((e.charIndex / (text.length || 1)) * 100); 
  };
  utterance.onend = () => { if (onEnd) onEnd(); };
  utterance.onerror = () => { if (onEnd) onEnd(); };
  
  synth.speak(utterance);
};
