import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Howl, Howler } from "howler";

type SoundType = "spin" | "win" | "lose" | "click" | "deposit" | "withdraw" | "background";

type Sounds = {
  [key in SoundType]: Howl;
};

type SoundContextType = {
  play: (sound: SoundType) => void;
  stop: (sound: SoundType) => void;
  isEnabled: boolean;
  toggleSound: () => void;
  volume: number;
  setVolume: (volume: number) => void;
};

const SOUND_STORAGE_KEY = "bottle9jabet-sound-settings";

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [sounds, setSounds] = useState<Sounds | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolumeState] = useState(0.7);

  useEffect(() => {
    // Load sound settings from localStorage
    const savedSettings = localStorage.getItem(SOUND_STORAGE_KEY);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsEnabled(settings.isEnabled);
      setVolumeState(settings.volume);
    }

    // Initialize sounds
    const soundsObj: Sounds = {
      spin: new Howl({ 
        src: ["https://cdn.freesound.org/previews/521/521059_762964-lq.mp3"],
        volume: volume,
      }),
      win: new Howl({ 
        src: ["https://cdn.freesound.org/previews/476/476177_9903474-lq.mp3"],
        volume: volume,
      }),
      lose: new Howl({ 
        src: ["https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3"],
        volume: volume,
      }),
      click: new Howl({ 
        src: ["https://cdn.freesound.org/previews/522/522565_6142149-lq.mp3"],
        volume: volume,
      }),
      deposit: new Howl({ 
        src: ["https://cdn.freesound.org/previews/320/320181_4359492-lq.mp3"],
        volume: volume,
      }),
      withdraw: new Howl({ 
        src: ["https://cdn.freesound.org/previews/188/188043_3493582-lq.mp3"],
        volume: volume,
      }),
      background: new Howl({ 
        src: ["https://cdn.freesound.org/previews/353/353084_5450487-lq.mp3"],
        volume: volume * 0.3, // Lower volume for background music
        loop: true,
      }),
    };
    
    setSounds(soundsObj);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (sounds) {
      // Update volume for all sounds when it changes
      Object.values(sounds).forEach(sound => {
        if (sound === sounds.background) {
          sound.volume(volume * 0.3); // Keep background music quieter
        } else {
          sound.volume(volume);
        }
      });
      
      // Save settings to localStorage
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify({ isEnabled, volume }));
    }
  }, [isEnabled, volume, sounds]);

  const play = (sound: SoundType) => {
    if (isInitialized && sounds && isEnabled) {
      sounds[sound].play();
    }
  };

  const stop = (sound: SoundType) => {
    if (isInitialized && sounds) {
      sounds[sound].stop();
    }
  };

  const toggleSound = () => {
    if (isEnabled) {
      if (sounds && sounds.background.playing()) {
        sounds.background.pause();
      }
    } else {
      if (sounds) {
        sounds.background.play();
      }
    }
    setIsEnabled(!isEnabled);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  // Start background music when sound is initialized and enabled
  useEffect(() => {
    if (isInitialized && sounds && isEnabled) {
      // Only start if not already playing
      if (!sounds.background.playing()) {
        sounds.background.play();
      }
    }
  }, [isInitialized, isEnabled, sounds]);

  return (
    <SoundContext.Provider value={{ play, stop, isEnabled, toggleSound, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
