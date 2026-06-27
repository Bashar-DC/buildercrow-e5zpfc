import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  ShoppingCart, 
  Coins, 
  Volume2, 
  VolumeX, 
  Tv, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Terminal, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Search, 
  Star, 
  Cpu, 
  Info,
  Gift,
  AlertTriangle,
  Wind,
  Activity,
  Flame
} from 'lucide-react';

// --- SOUND UTILITY ---
// Synthesis of pure retro 8-bit retro sounds using Web Audio API
const playRetroSound = (type: string, enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'coin') {
      // Classic 8-bit dual coin chime (Mario-style)
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'laser') {
      // Retro pitch slide-down
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'powerup') {
      // Sweet major arpeggio
      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.setValueAtTime(329.63, now + 0.08); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.16); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.24); // C5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start();
      osc.stop(now + 0.5);
    } else if (type === 'damage') {
      // Low noise crunch
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'blow') {
      // Synthesized wind noise (blowing into cartridge)
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
      
      noise.connect(filter);
      filter.connect(gain);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      noise.start();
      noise.stop(ctx.currentTime + 0.5);
    } else if (type === 'victory') {
      // Final level complete jingle
      const now = ctx.currentTime;
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start();
      osc.stop(now + 0.6);
    } else {
      // Default standard click beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (error) {
    console.warn("Web Audio block or error: ", error);
  }
};

// --- STATIC GAME DATA ---
interface RetroGame {
  id: string;
  title: string;
  year: string;
  platform: 'NES' | 'SNES' | 'SEGA' | 'ARCADE' | 'GAMEBOY' | 'N64';
  price: number;
  rating: number;
  condition: 'MINT' | 'LOOSE' | 'CIB' | 'NEW';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
  stock: number;
  image: string;
  description: string;
  specs: { developer: string; players: string; genre: string };
  badgeColor: string;
}

const RETRO_GAMES: RetroGame[] = [
  {
    id: 'game-1',
    title: 'SUPER MARIO WORLD',
    year: '1990',
    platform: 'SNES',
    price: 49.99,
    rating: 5,
    condition: 'CIB',
    rarity: 'UNCOMMON',
    stock: 4,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    description: 'The golden standard of 16-bit platforming. Explore Dinosaur Land with Yoshi for the first time! Complete with original gray custom box replica.',
    specs: { developer: 'Nintendo EAD', players: '1-2 Players', genre: 'Platformer' },
    badgeColor: 'from-amber-400 to-red-500'
  },
  {
    id: 'game-2',
    title: 'CHRONO TRIGGER',
    year: '1995',
    platform: 'SNES',
    price: 189.99,
    rating: 5,
    condition: 'MINT',
    rarity: 'LEGENDARY',
    stock: 2,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    description: 'A masterpiece of time travel roleplaying. Features original work by Akira Toriyama & Nobuo Uematsu. Absolute premium investment.',
    specs: { developer: 'Square Soft', players: '1 Player', genre: 'RPG' },
    badgeColor: 'from-purple-600 to-pink-500'
  },
  {
    id: 'game-3',
    title: 'SONIC THE HEDGEHOG 2',
    year: '1992',
    platform: 'SEGA',
    price: 29.99,
    rating: 4.8,
    condition: 'CIB',
    rarity: 'COMMON',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=400&q=80',
    description: 'Go fast, collect chaos emeralds, and unleash Super Sonic. Introducing Miles "Tails" Prower! Blast processing at its peak.',
    specs: { developer: 'SEGA Technical', players: '1-2 Players', genre: 'Action/Speed' },
    badgeColor: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'game-4',
    title: 'STREET FIGHTER II: SE',
    year: '1993',
    platform: 'SEGA',
    price: 45.00,
    rating: 4.7,
    condition: 'LOOSE',
    rarity: 'UNCOMMON',
    stock: 6,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    description: 'Authentic arcade competitive fighter right in your living room. Pull off spectacular Hadoukens with original Sega 6-button controller compatibility.',
    specs: { developer: 'Capcom', players: '1-2 Players', genre: 'Fighting' },
    badgeColor: 'from-red-600 to-yellow-500'
  },
  {
    id: 'game-5',
    title: 'METROID FUSION',
    year: '2002',
    platform: 'GAMEBOY',
    price: 84.99,
    rating: 4.9,
    condition: 'CIB',
    rarity: 'RARE',
    stock: 3,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    description: 'Survival horror meets classic Metroidvania action. Samus is infected by the deadly X Parasite on Space Station BSL. Incredible handheld story.',
    specs: { developer: 'Nintendo R&D1', players: '1 Player', genre: 'Adventure' },
    badgeColor: 'from-green-500 to-teal-400'
  },
  {
    id: 'game-6',
    title: 'DOOM: ORIGINAL DOS',
    year: '1993',
    platform: 'ARCADE',
    price: 34.99,
    rating: 4.9,
    condition: 'NEW',
    rarity: 'UNCOMMON',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    description: 'The grandfather of first-person shooters. Rip and tear your way through the phobos anomaly with a pristine original copy on floppy disks.',
    specs: { developer: 'id Software', players: '1 Player', genre: 'FPS' },
    badgeColor: 'from-orange-600 to-red-700'
  },
  {
    id: 'game-7',
    title: 'THE LEGEND OF ZELDA: OOT',
    year: '1998',
    platform: 'N64',
    price: 99.99,
    rating: 5,
    condition: 'CIB',
    rarity: 'RARE',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80',
    description: 'Universally hailed as one of the greatest games ever created. Traverse the plains of Hyrule, master the Ocarina, and defeat Ganondorf.',
    specs: { developer: 'Nintendo EAD', players: '1 Player', genre: 'Adventure' },
    badgeColor: 'from-yellow-400 to-emerald-600'
  },
  {
    id: 'game-8',
    title: 'PAC-MAN ORIGINAL',
    year: '1984',
    platform: 'NES',
    price: 19.99,
    rating: 4.5,
    condition: 'LOOSE',
    rarity: 'COMMON',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80',
    description: 'Retro game night is incomplete without simple pill-munching madness. Dodge Blinky, Pinky, Inky, and Clyde for high-score bragging rights.',
    specs: { developer: 'Namco', players: '1-2 Players (Alt)', genre: 'Arcade Classic' },
    badgeColor: 'from-yellow-500 to-orange-400'
  }
];

export default function App() {
  // --- RETRO STATES ---
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cart, setCart] = useState<{ game: RetroGame; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [arcadeTokens, setArcadeTokens] = useState<number>(15);
  const [couponActive, setCouponActive] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'success'>('idle');
  const [visitorCount, setVisitorCount] = useState<number>(318492);

  // Custom interactive 90s console cartridge states
  const [connectorGlitch, setConnectorGlitch] = useState<boolean>(false);
  const [glitchMessage, setGlitchMessage] = useState<string>("");
  const [blowStrength, setBlowStrength] = useState<number>(0);
  const [cabinetMessage, setCabinetMessage] = useState<string>("INSERT COIN OR CLICK CABINET TO GAIN TOKENS!");
  const [cabinetComboCount, setCabinetComboCount] = useState<number>(0);

  // Simulate occasional glitch to force the user to "blow into the cartridge" (classic 90s style)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connectorGlitch && Math.random() < 0.25) {
        setConnectorGlitch(true);
        setGlitchMessage("⚠️ WARNING: SCREEN SCRAMBLED! BLOW ON THE CARTRIDGE DECK TO FIX THE COPPER PIN CONTACTS!");
        triggerBeep('damage');
      }
    }, 45000); // Check/trigger every 45s
    return () => clearInterval(interval);
  }, [connectorGlitch]);

  // Simulate visitor ticker increment
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerBeep = (type: string) => {
    playRetroSound(type, soundEnabled);
  };

  const handleCabinetClick = () => {
    triggerBeep('coin');
    setArcadeTokens(prev => prev + 1);
    const newCombo = cabinetComboCount + 1;
    setCabinetComboCount(newCombo);
    
    if (newCombo % 10 === 0) {
      setCabinetMessage(`COMBO X${newCombo}! RADICAL BONUS TOKENS UNLOCKED!`);
      setArcadeTokens(prev => prev + 5);
      triggerBeep('powerup');
    } else {
      const phrases = [
        "RADICAL!", "BOOMSHAKALAKA!", "TOASTY!", "HIGH SCORE!", 
        "LEVEL UP!", "WAVEY!", "FATAL ACCURACY!", "NICE CLICKS!", "SHWING!"
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCabinetMessage(`${randomPhrase} (+1 TOKEN)`);
    }
  };

  // Blow into cartridge mechanics
  const handleBlowCartridge = () => {
    triggerBeep('blow');
    setBlowStrength(prev => {
      const next = prev + 35;
      if (next >= 100) {
        // Glitch is resolved!
        setConnectorGlitch(false);
        setBlowStrength(0);
        setCabinetMessage("✨ SUCCESS! CARTRIDGE Pins SHINED AND DETECTED. SYSTEM BOOT OK!");
        setArcadeTokens(t => t + 10); // Reward for fixing system
        triggerBeep('victory');
        return 0;
      }
      return next;
    });
  };

  // Add to cart helper
  const handleAddToCart = (game: RetroGame) => {
    // If the game system is glitched, prevent buying until they blow on the cartridge!
    if (connectorGlitch) {
      triggerBeep('damage');
      setGlitchMessage("❌ ERROR: CANNOT ACCESS RAM SLOT. CLEAN THE CARTRIDGE PINS FIRST!");
      return;
    }
    
    triggerBeep('powerup');
    setCart(prev => {
      const existing = prev.find(item => item.game.id === game.id);
      if (existing) {
        return prev.map(item => 
          item.game.id === game.id 
            ? { ...item, quantity: Math.min(item.quantity + 1, game.stock) } 
            : item
        );
      }
      return [...prev, { game, quantity: 1 }];
    });
  };

  const handleDecQuantity = (gameId: string) => {
    triggerBeep('damage');
    setCart(prev => {
      const existing = prev.find(item => item.game.id === gameId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.game.id === gameId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.game.id !== gameId);
    });
  };

  const handleRedeemCoupon = () => {
    if (arcadeTokens >= 30) {
      triggerBeep('victory');
      setArcadeTokens(prev => prev - 30);
      setCouponActive(true);
      setCabinetMessage("PROMO CODE: 'RETROPASS' UNLOCKED! 25% DISCOUNT APPLIED!");
    } else {
      triggerBeep('damage');
      setCabinetMessage("INSUFFICIENT TOKENS! NEED AT LEAST 30 TOKENS.");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    triggerBeep('victory');
    setCheckoutStep('success');
    setCart([]);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  // Calculate cart cost
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.game.price * item.quantity), 0);
  const discount = couponActive ? rawSubtotal * 0.25 : 0;
  const totalCost = rawSubtotal - discount;

  // Filter games based on search & tab platform
  const filteredGames = RETRO_GAMES.filter(game => {
    const matchesCategory = selectedCategory === 'ALL' || game.platform === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.specs.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen relative overflow-x-hidden bg-[#000033] text-[#00ff00] font-mono transition-all selection:bg-pink-600 selection:text-white`}>
      {/* Starfield, retro scanlines and classic 90s Geocities/Windows-95 theme styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Share+Tech+Mono&display=swap');
        
        .retro-title {
          font-family: 'Press Start 2P', monospace;
        }
        .retro-body {
          font-family: 'VT323', monospace;
        }
        .retro-tech {
          font-family: 'Share Tech Mono', monospace;
        }

        /* CRT Effects */
        .crt-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 5px, 6px 100%;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.95;
        }

        /* 90s Retro starfield background simulation */
        .retro-space-bg {
          background-image: 
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
            radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px);
          background-size: 550px 550px, 350px 350px, 250px 250px;
          background-position: 0 0, 40px 60px, 130px 270px;
        }

        /* Geocities Style Blinking text animation */
        .blink-retro {
          animation: blink-anim 1.2s steps(2, start) infinite;
        }
        @keyframes blink-anim {
          to { visibility: hidden; }
        }

        /* Marquee speed */
        .animate-marquee {
          animation: marquee-scroll 25s linear infinite;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        /* 90s chunky beveled borders - Windows 95 Style */
        .win95-box {
          background: #c0c0c0;
          border-top: 3px solid #ffffff;
          border-left: 3px solid #ffffff;
          border-right: 3px solid #808080;
          border-bottom: 3px solid #808080;
          color: #000000;
          box-shadow: 1px 1px 0px #000;
        }

        .win95-box-inset {
          background: #ffffff;
          border-top: 3px solid #808080;
          border-left: 3px solid #808080;
          border-right: 3px solid #ffffff;
          border-bottom: 3px solid #ffffff;
        }

        .win95-titlebar {
          background: linear-gradient(90deg, #000080, #1084d0);
          color: white;
          font-family: 'Share Tech Mono', monospace;
        }

        /* Under construction strip */
        .under-construction-strip {
          background: repeating-linear-gradient(
            -45deg,
            #eab308,
            #eab308 10px,
            #000000 10px,
            #000000 20px
          );
          height: 16px;
          width: 100%;
        }

        /* Glitch Animation for when contacts are dirty */
        .retro-glitched-screen {
          animation: glitch-anim 0.3s infinite;
          filter: hue-rotate(90deg) contrast(1.5);
        }
        @keyframes glitch-anim {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          20% { transform: translate(-2px, -1px) rotate(0.5deg); }
          40% { transform: translate(-1px, 2px) rotate(-0.5deg); }
          60% { transform: translate(2px, 1px) rotate(0deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          100% { transform: translate(1px, 2px) rotate(-1deg); }
        }

        /* Glowing text accents */
        .glow-cyan-text {
          text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
        }
        .glow-pink-text {
          text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
        }
        .glow-yellow-text {
          text-shadow: 0 0 8px #ffff00, 0 0 15px #ffff00;
        }

        /* Chunky 90s button shadows */
        .button-90s-pink {
          background-color: #ff0055;
          border: 3px solid #000;
          box-shadow: 4px 4px 0px #000;
          color: white;
        }
        .button-90s-pink:active {
          transform: translate(3px, 3px);
          box-shadow: 1px 1px 0px #000;
        }

        .button-90s-green {
          background-color: #00ff66;
          border: 3px solid #000;
          box-shadow: 4px 4px 0px #000;
          color: #000;
        }
        .button-90s-green:active {
          transform: translate(3px, 3px);
          box-shadow: 1px 1px 0px #000;
        }

        .button-90s-blue {
          background-color: #0088ff;
          border: 3px solid #000;
          box-shadow: 4px 4px 0px #000;
          color: #fff;
        }
        .button-90s-blue:active {
          transform: translate(3px, 3px);
          box-shadow: 1px 1px 0px #000;
        }
      `}</style>

      {/* Retro Space Star Backdrop */}
      <div className="absolute inset-0 retro-space-bg opacity-30 pointer-events-none z-0" />

      {/* --- CRT SCAN LINE LAYER --- */}
      {crtEnabled && <div className="crt-overlay" />}

      {/* --- UNDER CONSTRUCTION SIGNAGE / CLASSIC WEB BANNER --- */}
      <div className="under-construction-strip" />
      <div className="bg-black text-center py-1 text-[11px] retro-tech text-yellow-400 font-bold flex justify-center items-center gap-4 border-b border-yellow-500 z-50 relative">
        <span className="blink-retro">⚠️</span> 
        <span>BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 OR INTERNET EXPLORER 3.0 // 800x600 RESOLUTION</span> 
        <span className="blink-retro">⚠️</span>
      </div>

      {/* --- SCROLLING 90S RUNNING TICKER --- */}
      <div className="bg-black text-xs retro-tech text-[#00ff55] py-1 border-b-2 border-green-800 overflow-hidden relative flex items-center z-20">
        <div className="whitespace-nowrap flex animate-marquee">
          <span className="mx-8 flex items-center text-pink-500 font-bold">
            <Flame className="w-4 h-4 mr-2" /> !!! SUPER 16-BIT CARTRIDGES IN STOCK !!!
          </span>
          <span className="mx-8 text-yellow-300">
            💾 VINTAGE REPLACEMENT BATTERIES INSTALLED FOR SAFER SAVES (CR2032)
          </span>
          <span className="mx-8 text-cyan-400">
            🎮 LEVEL-UP STATUS: REDEEM TOKENS TO UNLOCK THE 25% DISCOUNT COUPON 'RETROPASS'
          </span>
          <span className="mx-8 text-[#00ff00]">
            ⚡ SYSTEM NOTIFICATION: IF SCREEN STARTS FLICKERING, PLEASE BLOW ON OUR CARTRIDGE CONNECTOR IN THE CABINET DECK!
          </span>
        </div>
      </div>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className={`relative z-10 transition-all ${connectorGlitch ? 'retro-glitched-screen' : ''}`}>

        {/* --- TOP HEADER & RETRO CONTROLS BAR --- */}
        <header className="container mx-auto px-4 py-4 relative z-20">
          
          {/* Windows 95 System Windows Frame */}
          <div className="win95-box p-1">
            <div className="win95-titlebar p-1.5 flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm tracking-wider">
                <Gamepad2 className="w-4 h-4" /> RETRO-BYTE.EXE (PIXEL SHOP v1.95)
              </span>
              <div className="flex gap-1">
                <button onClick={() => triggerBeep('click')} className="w-5 h-5 bg-[#c0c0c0] text-black border border-white border-b-gray-800 text-xs font-extrabold flex items-center justify-center">_</button>
                <button onClick={() => triggerBeep('click')} className="w-5 h-5 bg-[#c0c0c0] text-black border border-white border-b-gray-800 text-xs font-extrabold flex items-center justify-center">▣</button>
                <button onClick={() => triggerBeep('damage')} className="w-5 h-5 bg-red-600 text-white border border-white border-b-gray-800 text-xs font-extrabold flex items-center justify-center">X</button>
              </div>
            </div>

            <div className="p-4 bg-[#110022] text-yellow-300 flex flex-wrap items-center justify-between gap-4 border-t-2 border-gray-600">
              
              {/* Logo Brand / Giant Retro Title */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => { triggerBeep('coin'); setSelectedCategory('ALL'); }}>
                <div className="bg-gradient-to-br from-pink-600 to-yellow-500 p-3 border-4 border-double border-white shadow-[3px_3px_0px_#000]">
                  <Gamepad2 className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div>
                  <h1 className="retro-title text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400 tracking-wider glow-yellow-text">
                    RETRO-BYTE
                  </h1>
                  <p className="text-[10px] text-cyan-300 retro-tech uppercase tracking-widest mt-0.5 flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full inline-block mr-2 animate-ping" />
                    BBS EST. 1992 // CHIP-TUNED CARTRIDGE SHACK
                  </p>
                </div>
              </div>

              {/* MS-DOS CLI Command prompt search bar */}
              <div className="relative flex-1 max-w-sm min-w-[200px]">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-pink-500 font-extrabold retro-tech text-xs">
                  C:\GAMES&gt;
                </div>
                <input 
                  type="text" 
                  placeholder="SEARCH_CATALOG.EXE..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    triggerBeep('click');
                  }}
                  className="w-full bg-black border-2 border-[#ff00ff] text-[#00ff55] py-2 pl-24 pr-4 rounded-none retro-tech focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm placeholder-green-900 uppercase"
                />
                <Search className="absolute right-3 top-2.5 w-4.5 h-4.5 text-pink-500" />
              </div>

              {/* Interactive Widget Hub */}
              <div className="flex items-center gap-3 flex-wrap">
                
                {/* 90s Visitor Counter Display */}
                <div className="bg-black border-2 border-gray-700 px-3 py-1 text-center font-mono text-red-500">
                  <p className="text-[8px] text-white/50 uppercase tracking-widest">VISITOR COUNTER</p>
                  <p className="text-sm font-bold tracking-widest text-[#00ff55] bg-slate-900 px-1 border border-black">
                    {visitorCount.toString().padStart(7, '0')}
                  </p>
                </div>

                {/* Token Counter Panel */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    triggerBeep('coin');
                    handleCabinetClick();
                  }}
                  className="cursor-pointer bg-black border-2 border-yellow-400 px-3 py-1.5 text-xs retro-tech flex items-center gap-2 text-yellow-300"
                >
                  <Coins className="w-5 h-5 text-yellow-400 animate-spin" />
                  <div>
                    <p className="text-[8px] text-gray-400">ARCADE TOKENS</p>
                    <p className="font-bold text-sm tracking-wider">{arcadeTokens} <span className="text-[9px] text-pink-400 font-bold">(COIN+)</span></p>
                  </div>
                </motion.div>

                {/* Sound On/Off Switch */}
                <button 
                  onClick={() => {
                    const targetState = !soundEnabled;
                    setSoundEnabled(targetState);
                    if (targetState) {
                      playRetroSound('coin', true);
                    }
                  }}
                  className={`p-2 border-2 ${soundEnabled ? 'border-[#00ff00] text-[#00ff00]' : 'border-red-500 text-red-500'} bg-black`}
                  title="Sound FX Toggle"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {/* CRT Screen Toggle */}
                <button 
                  onClick={() => {
                    triggerBeep('click');
                    setCrtEnabled(!crtEnabled);
                  }}
                  className={`p-2 border-2 ${crtEnabled ? 'border-cyan-400 text-cyan-400' : 'border-gray-500 text-gray-500'} bg-black`}
                  title="Toggle CRT Screen Curve Filter"
                >
                  <Tv className="w-5 h-5" />
                </button>

                {/* Cart Trigger */}
                <button 
                  onClick={() => {
                    triggerBeep('powerup');
                    setCartOpen(true);
                  }}
                  className="button-90s-pink px-4 py-2 retro-title text-[10px] tracking-tighter flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span>CART [{cart.reduce((total, i) => total + i.quantity, 0)}]</span>
                </button>

              </div>
            </div>
          </div>
        </header>

        {/* --- DYNAMIC INTERACTIVE CARTRIDGE CLEANER BANNER --- */}
        {connectorGlitch && (
          <section className="container mx-auto px-4 py-2 relative z-50">
            <div className="bg-red-950 border-4 border-red-500 p-4 text-center space-y-3 shadow-lg relative">
              <div className="absolute top-2 right-2 flex gap-1">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
              </div>
              <h3 className="retro-title text-xs text-yellow-400 tracking-wider">
                ⚠️ WARNING: RETRO CONTACT RESISTANCE DETECTED (GLITCH OUT!)
              </h3>
              <p className="retro-body text-xl text-white/90">
                Classic 90s error: Dust has settled on the cartridge microchip contacts. 
                Use the wind nozzle bellow to <span className="text-cyan-400 font-extrabold animate-pulse">BLOW ON THE CARTRIDGE CARRIER</span> to clean the metal pins!
              </p>
              
              <div className="max-w-md mx-auto bg-black p-3 border-2 border-red-800">
                <div className="flex justify-between text-xs text-gray-400 mb-1 retro-tech uppercase">
                  <span>Pin Airflow Clean Rate:</span>
                  <span>{blowStrength}%</span>
                </div>
                <div className="w-full bg-slate-900 h-5 border-2 border-gray-600 relative">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full transition-all duration-150"
                    style={{ width: `${blowStrength}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] retro-title text-white">
                    {blowStrength < 100 ? "BLOW CARTRIDGE CONTACTS" : "READY TO RUN"}
                  </div>
                </div>

                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={handleBlowCartridge}
                    className="button-90s-green py-2 px-6 flex items-center gap-2 text-xs font-bold uppercase"
                  >
                    <Wind className="w-4 h-4 animate-spin" />
                    <span>💨 *PUFF* BLOW INTO CART</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- MAIN HERO CABINET BANNER --- */}
        <section className="container mx-auto px-4 py-2 relative z-10">
          <div className="bg-gradient-to-b from-[#1c0033] to-[#0d001a] border-4 border-[#ff00ff] p-6 rounded-none relative overflow-hidden shadow-[6px_6px_0px_#00ffff]">
            
            {/* Subtle retro horizontal lines design layout inside banner */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_2px,transparent_2px)] bg-[size:100%_24px] pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* Retro Promo Column */}
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-block bg-pink-600 text-black font-extrabold text-[10px] retro-title px-3 py-1 tracking-wider uppercase">
                  ⚡ 100% AUTHENTIC 90S BOARDS ⚡
                </span>
                <h2 className="retro-title text-2xl md:text-4xl text-white leading-tight tracking-normal">
                  THE VINTAGE CARTRIDGE <span className="text-yellow-400 italic font-bold block mt-1 glow-cyan-text">GOLDEN MINE!</span>
                </h2>
                <p className="retro-body text-2xl text-cyan-300 leading-relaxed">
                  Welcome to Retro-Byte, kid! Experience clean, tested, and original arcade releases, SNES RPG class acts, and legendary 8-bit NES cartridges. Dust shells polished & ship to your mailbox in anti-magnetic sleeves.
                </p>

                {/* Simulated Geocities Coupon Banner */}
                <div className="bg-[#000] border-2 border-dashed border-yellow-400 p-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="bg-pink-600 p-2.5 border border-white">
                    <Gift className="w-8 h-8 text-yellow-300 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="retro-title text-xs text-yellow-400">CHIP-TUNED BBS DISCOUNT CODE</h4>
                    <p className="retro-body text-xl text-white/90 leading-snug">
                      Extract <span className="text-pink-500 font-extrabold">30 Arcade Coins</span> using our classic cabinet trigger mechanism to the right, then exchange them for an instant <span className="text-green-400 font-bold">25% OFF DISCOUNT</span>!
                    </p>
                  </div>
                </div>

                {/* Classic Platform Console Tags */}
                <div className="flex flex-wrap gap-2 pt-2 text-xs font-bold text-black retro-tech">
                  <span className="bg-red-500 px-3 py-1 border border-black shadow-[2px_2px_0px_#fff]">NES 8-BIT</span>
                  <span className="bg-blue-500 px-3 py-1 border border-black text-white shadow-[2px_2px_0px_#fff]">SNES 16-BIT</span>
                  <span className="bg-amber-500 px-3 py-1 border border-black shadow-[2px_2px_0px_#fff]">SEGA GENESIS</span>
                  <span className="bg-green-500 px-3 py-1 border border-black shadow-[2px_2px_0px_#fff]">GAMEBOY COLOR</span>
                  <span className="bg-purple-500 px-3 py-1 border border-black text-white shadow-[2px_2px_0px_#fff]">N64 3D</span>
                </div>
              </div>

              {/* 90s Simulated Interactive Arcade Cabinet dispenser */}
              <div className="lg:col-span-5">
                <div className="win95-box p-1 relative shadow-lg">
                  
                  {/* Win95 window bar style */}
                  <div className="win95-titlebar p-1 flex items-center justify-between text-xs font-bold">
                    <span>COIN_DISPENSER.EXE</span>
                    <span className="text-[10px]">16-BIT BUS</span>
                  </div>

                  <div className="p-4 bg-black text-yellow-300 space-y-3">
                    
                    <div className="bg-indigo-950 p-1.5 text-center border border-indigo-800">
                      <h3 className="retro-title text-[9px] text-cyan-300 tracking-widest animate-pulse font-extrabold">
                        ★ RETRO TOKENS DESK ★
                      </h3>
                    </div>

                    {/* Console Screen panel */}
                    <div className="bg-slate-950 border-2 border-[#00ff55] p-3 rounded-none relative overflow-hidden">
                      <div className="space-y-1">
                        <p className="text-xs text-white uppercase retro-tech">COIN CABINET STATE: ONLINE</p>
                        <p className="text-xs text-green-400 retro-tech">TOTAL COINS SPENT: {arcadeTokens}</p>
                        <p className="text-xs text-yellow-400 retro-tech">BONUS MULTIPLIER: {cabinetComboCount}/10 clicks</p>
                        
                        <div className="w-full bg-slate-900 h-2 border border-slate-700 mt-1">
                          <div 
                            className="bg-pink-500 h-full transition-all duration-150" 
                            style={{ width: `${(cabinetComboCount % 10) * 10}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 border-t border-slate-800 pt-2 text-center">
                        <p className="retro-body text-lg text-pink-500 uppercase tracking-widest animate-pulse">
                          &gt; {cabinetMessage}
                        </p>
                      </div>
                    </div>

                    {/* Classic Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleCabinetClick}
                        className="button-90s-blue py-3 text-center text-xs font-extrabold uppercase flex flex-col items-center justify-center"
                      >
                        <span className="retro-title text-[9px] mb-1">INSERT COIN</span>
                        <span className="text-[9px] text-yellow-300 font-extrabold">(COIN CLICKER)</span>
                      </button>

                      <button 
                        onClick={handleRedeemCoupon}
                        disabled={couponActive}
                        className={`py-3 text-center text-xs font-bold uppercase flex flex-col items-center justify-center border-2 border-black transition-all ${
                          couponActive 
                            ? 'bg-green-700 text-black line-through cursor-not-allowed' 
                            : 'button-90s-green'
                        }`}
                      >
                        <span className="retro-title text-[9px] mb-1">REDEEM COUPON</span>
                        <span className="text-[9px] text-slate-800 font-extrabold">(COST: 30 TOKENS)</span>
                      </button>
                    </div>

                    <div className="text-[9px] text-gray-500 mt-2 text-center uppercase retro-tech">
                      * Uses pure Web Audio chip-tune wave oscillators!
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- PLATFORM FILTER CHIPS & CORE CATALOG --- */}
        <main className="container mx-auto px-4 py-6 relative z-10">
          
          {/* Terminal Style Navigation Header */}
          <div className="flex items-center gap-2 mb-6 text-pink-500 text-sm border-b-2 border-pink-900 pb-2">
            <Terminal className="w-5 h-5 text-[#00ff55]" />
            <span className="retro-title text-[11px] md:text-xs tracking-wider uppercase text-cyan-300">
              CHOOSE A GAME SYSTEM COMPATIBILITY SYSTEM:
            </span>
          </div>

          {/* Windows 95 Style Category Tab List */}
          <div className="flex flex-wrap gap-2 mb-8 bg-[#c0c0c0] p-1.5 border border-white border-b-gray-800">
            {['ALL', 'NES', 'SNES', 'SEGA', 'GAMEBOY', 'N64', 'ARCADE'].map((platform) => (
              <button
                key={platform}
                onClick={() => {
                  triggerBeep('click');
                  setSelectedCategory(platform);
                }}
                className={`px-4 py-2 text-xs font-bold retro-title tracking-tight transition-all duration-100 ${
                  selectedCategory === platform
                    ? 'bg-[#ffffff] text-[#000000] border-t-2 border-l-2 border-black border-r-2 border-b-0'
                    : 'bg-[#c0c0c0] text-[#000000] border border-white border-b-gray-800 hover:bg-[#d5d5d5]'
                }`}
              >
                💾 {platform}
              </button>
            ))}
          </div>

          {/* Coupon alert banner */}
          {couponActive && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-3 bg-green-500 border-4 border-black text-black font-extrabold text-sm retro-tech uppercase flex items-center justify-between shadow-[4px_4px_0px_#000]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                SUCCESS: 25% CHIP-TUNE DISCOUNT CODE 'RETROPASS' APPLIED TO ESTIMATE!
              </span>
              <button 
                onClick={() => {
                  setCouponActive(false);
                  triggerBeep('damage');
                }}
                className="px-2 py-0.5 border border-black bg-white/30 text-xs hover:bg-white/50"
              >
                REMOVE CODE
              </button>
            </motion.div>
          )}

          {/* --- CORE RETRO CATALOG GRID --- */}
          {filteredGames.length === 0 ? (
            <div className="bg-black border-4 border-double border-red-500 p-12 text-center rounded-none my-10">
              <h3 className="retro-title text-red-500 text-lg mb-3">SYSTEM_ERROR_404: NO PLATFORM ROMS FOUND</h3>
              <p className="retro-body text-2xl text-white/80">
                The targeted system drive currently has 0 cartridges inserted. Reset constraints or select a different console!
              </p>
              <button 
                onClick={() => {
                  triggerBeep('victory');
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 button-90s-blue px-4 py-2 retro-title text-xs text-white inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> RESET PLATFORMS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <motion.div
                  key={game.id}
                  layout
                  whileHover={{ y: -6 }}
                  className="bg-black border-4 border-gray-600 hover:border-pink-500 transition-colors flex flex-col justify-between group relative shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#00ffff]"
                >
                  
                  {/* Cartridge Style Header with Label stickers */}
                  <div>
                    <div className="bg-slate-900 border-b-2 border-gray-600 p-2 flex items-center justify-between text-[10px] text-white/80 retro-tech">
                      <span className="font-extrabold flex items-center gap-1 uppercase text-cyan-300">
                        <Cpu className="w-3.5 h-3.5 text-pink-500" />
                        {game.platform} ROM SLOTS
                      </span>
                      <span className="text-yellow-400 font-extrabold flex items-center gap-1 uppercase tracking-widest bg-yellow-400/10 px-1.5 py-0.5 border border-yellow-400/40">
                        🏅 {game.condition}
                      </span>
                    </div>

                    {/* Vintage high contrast box image container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-gray-600 bg-slate-950 group-hover:scale-[1.01] transition-transform">
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover filter contrast-[1.15] brightness-[0.95] group-hover:contrast-125 transition-all"
                      />
                      
                      {/* Interactive Tags overlay */}
                      <div className="absolute bottom-2 left-2 bg-black border border-cyan-400 text-cyan-400 px-2 py-0.5 text-[9px] retro-title tracking-tighter">
                        🎮 {game.platform}
                      </div>

                      <div className={`absolute top-2 right-2 bg-black border-2 border-yellow-400 text-yellow-300 px-2 py-0.5 text-[9px] retro-title font-extrabold`}>
                        {game.rarity}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10 pointer-events-none" />
                    </div>

                    {/* Title and Specs Description Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="retro-title text-[12px] text-white tracking-wide leading-tight group-hover:text-cyan-300 transition-colors uppercase">
                          {game.title}
                        </h3>
                        <p className="text-[9px] text-[#00ff55] retro-tech mt-1 uppercase">
                          RELEASE YEAR: {game.year} | GENRE: {game.specs.genre}
                        </p>
                      </div>

                      {/* 5-Star Rating System */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(game.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-800'
                            }`} 
                          />
                        ))}
                        <span className="text-[11px] text-white/70 retro-tech ml-1">({game.rating})</span>
                      </div>

                      <p className="retro-body text-xl text-gray-300 line-clamp-3 leading-snug">
                        {game.description}
                      </p>

                      <div className="bg-[#050011] p-2 border border-slate-800 text-[10px] retro-tech text-cyan-400/95 space-y-0.5">
                        <div className="flex justify-between">
                          <span>DEV: {game.specs.developer}</span>
                          <span className="text-pink-400 font-bold">{game.specs.players}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Purchase Area */}
                  <div className="p-4 pt-0 border-t border-slate-900">
                    <div className="flex items-center justify-between gap-2 pt-3">
                      <div className="text-left">
                        <p className="text-[8px] text-gray-500 retro-tech uppercase">PRICE VALUE</p>
                        <p className="retro-title text-sm text-yellow-300 font-extrabold glow-yellow-text">
                          ${game.price.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(game)}
                        disabled={game.stock === 0}
                        className="button-90s-pink px-3.5 py-2 retro-title text-[9px] tracking-tighter uppercase font-extrabold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD TO CART
                      </button>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="text-[9px] retro-tech uppercase tracking-widest text-pink-500 font-bold animate-pulse">
                        ⚡ ONLY {game.stock} UNIT(S) IN BASKET
                      </span>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

          {/* --- RETRO SOUNDBOARD CONTROLLER MODULE --- */}
          <section className="mt-16 bg-black border-4 border-cyan-400 p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/10 to-transparent pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-4 space-y-2">
                <span className="inline-block bg-cyan-400 text-black px-2 py-0.5 text-[9px] retro-title font-extrabold">
                  CHIP-SYNTH 8-BIT DRUM KIT
                </span>
                <h3 className="retro-title text-xs text-white">SOUNDBOARD FX MODS</h3>
                <p className="retro-body text-xl text-white/80">
                  Trigger raw micro-chip synthesizer signals directly in your system browser! Authentic pitch shifts, noise sweeps & high-arpeggio signals.
                </p>
              </div>

              <div className="md:col-span-8">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { name: 'COIN CHIME', type: 'coin', label: 'SQR' },
                    { name: 'LASER SLIDE', type: 'laser', label: 'SAW' },
                    { name: 'POWER ARPEG', type: 'powerup', label: 'TRI' },
                    { name: 'BLOW CARTRIDGE', type: 'blow', label: 'NOISE' },
                    { name: 'VICTORY OUT', type: 'victory', label: 'COMBO' },
                  ].map((sound) => (
                    <button
                      key={sound.type}
                      onClick={() => playRetroSound(sound.type, soundEnabled)}
                      className="p-3 bg-gray-800 text-white font-extrabold border-2 border-white hover:bg-gray-700 active:translate-y-0.5 transition-all text-center flex flex-col items-center justify-center"
                    >
                      <span className="retro-title text-[8px] tracking-tighter block mb-1 text-yellow-300">▶ {sound.name}</span>
                      <span className="text-[9px] text-[#00ff55] font-mono tracking-widest uppercase">WAVE: {sound.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* --- BBS BULLETIN BOARD & GUESTBOOK --- */}
          <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Windows 95 Style Guestbook Win */}
            <div className="win95-box p-1">
              <div className="win95-titlebar p-1.5 flex items-center justify-between text-xs font-bold">
                <span>GUESTBOOK_BBS.TXT</span>
                <span>COM_1</span>
              </div>
              <div className="p-4 bg-black text-cyan-400">
                <h3 className="retro-title text-[9px] text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-pink-500 animate-pulse" /> RETRO GUESTBOOK SIGNATURES
                </h3>
                <p className="retro-body text-lg text-white/70 mb-4 leading-normal">
                  Connect via retro 28.8k dial-up analog modem and sign our guestbook! Let other gamers know what console chip is best.
                </p>
                <div className="space-y-3 max-h-[190px] overflow-y-auto pr-2 text-xs font-mono text-[#00ff55] retro-tech">
                  <div className="p-2 bg-slate-950 border border-slate-800">
                    <p className="text-pink-500 font-bold">[SYSOP_MARIO94] // 10 MINS AGO</p>
                    <p>"Clean cartridges arrived in secure thermal packaging. Play amazing on my original retro console clone!"</p>
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-800">
                    <p className="text-yellow-400 font-bold">[GENESIS_KID] // 2 HOURS AGO</p>
                    <p>"Sonic 2 speeds are still unmatched! SEGA does what Nintendon't!"</p>
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-800">
                    <p className="text-cyan-400 font-bold">[CHRONO_LOVER] // YESTERDAY</p>
                    <p>"I finally grabbed a pristine Chrono Trigger. The internal battery backup cartridge saves game data perfectly!"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription Column */}
            <div className="win95-box p-1 flex flex-col justify-between">
              <div>
                <div className="win95-titlebar p-1.5 flex items-center justify-between text-xs font-bold">
                  <span>NEWSLETTER_REGISTRY.EXE</span>
                  <span>16-BIT BUS</span>
                </div>
                <div className="p-4 bg-black text-[#00ff55]">
                  <h3 className="retro-title text-[9px] text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-400" /> DAILY VINTAGE RESTOCK ALERTS
                  </h3>
                  <p className="retro-body text-lg text-white/70 leading-normal mb-4">
                    Subscribe your email address. We scour vintage thrift yards, classic garage sales, and Japanese retro trade bins daily to stock rare console chips!
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-black pt-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    triggerBeep('victory');
                    alert("SUCCESS! SUBSCRIBED TO CHIP CATALOG UPDATES!");
                  }} 
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="email" 
                      required
                      placeholder="DIAL_UP_EMAIL@RETRO.NET" 
                      className="bg-[#111111] border-2 border-cyan-400 p-2.5 rounded-none text-yellow-300 retro-tech text-sm placeholder-cyan-900/90 uppercase focus:outline-none flex-1"
                    />
                    <button 
                      type="submit" 
                      className="button-90s-pink px-4 py-2 retro-title text-[8px] uppercase font-bold"
                    >
                      SUBSCRIBE
                    </button>
                  </div>
                  <p className="text-[9px] text-pink-500 font-extrabold tracking-widest uppercase">
                    * Zero tracking or spam, only physical retro stock lists!
                  </p>
                </form>
              </div>
            </div>

          </section>

        </main>

        {/* --- 90S COMPATIBILITY FOOTER BADGES --- */}
        <footer className="bg-black text-center py-12 mt-20 border-t-4 border-pink-900 relative z-10 text-xs text-white/60">
          <div className="container mx-auto px-4 space-y-6">
            
            <div className="flex justify-center items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-pink-500" />
              <span className="retro-title text-[10px] text-white uppercase tracking-widest">
                RETRO-BYTE CARTRIDGES LTD. © 1992 - {new Date().getFullYear()}
              </span>
            </div>

            <p className="retro-body text-xl max-w-xl mx-auto text-yellow-400/90 leading-relaxed">
              All physical game assets are hand-burnished, contacts polished, and internal SRAM retention batteries replaced with premium Panasonic retainers. Perfect for nostalgic vintage play!
            </p>

            {/* Simulated 90s Webring and Netscape badges */}
            <div className="flex justify-center items-center gap-4 flex-wrap text-black text-[10px] font-extrabold">
              <span className="bg-yellow-400 px-3 py-1 border border-black shadow-[2px_2px_0px_#fff]">HTML 3.2 COMPLIANT</span>
              <span className="bg-cyan-500 px-3 py-1 border border-black text-white shadow-[2px_2px_0px_#fff]">NETSCAPE NAVIGATOR READY</span>
              <span className="bg-pink-500 px-3 py-1 border border-black text-white shadow-[2px_2px_0px_#fff]">WEBRING MEMBER #3184</span>
            </div>

            <div className="text-[9px] retro-tech space-y-1 text-cyan-400 uppercase">
              <p>HARDWARE CORE: 16-BIT AUDIO DSP | CPU CLOCK SPEED: 33.33 MHZ | STACK MEMORY: OK</p>
              <p>DESIGNED & SHIPPED IN SECURE ANTI-STATIC CART BOXES NATIONWIDE</p>
            </div>

          </div>
        </footer>

        {/* --- RETRO SHOPPING CART MODAL DRAWER --- */}
        <AnimatePresence>
          {cartOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              
              {/* Dark backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  triggerBeep('damage');
                  setCartOpen(false);
                }}
                className="absolute inset-0 bg-slate-950"
              />

              {/* Windows 95 Style Cart Window Frame */}
              <div className="absolute inset-y-0 right-0 max-w-md w-full pl-6 flex">
                <motion.div 
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-screen max-w-md bg-[#13072e] border-l-4 border-pink-500 p-6 flex flex-col justify-between relative shadow-2xl"
                >
                  {/* CRT Retro overlay inside drawer */}
                  {crtEnabled && <div className="crt-overlay" />}

                  <div>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between border-b-4 border-pink-600 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-pink-500 animate-pulse" />
                        <h3 className="retro-title text-[10px] text-white uppercase tracking-widest">RETRO ORDER MANIFEST</h3>
                      </div>
                      
                      <button 
                        onClick={() => {
                          triggerBeep('damage');
                          setCartOpen(false);
                        }}
                        className="px-2 py-1 border-2 border-red-500 bg-black text-red-500 retro-tech font-bold hover:bg-red-500 hover:text-white"
                      >
                        [CLOSE ESC]
                      </button>
                    </div>

                    {/* Checkout Success Block */}
                    {checkoutStep === 'success' ? (
                      <div className="space-y-6 text-center py-10">
                        <div className="w-16 h-16 bg-green-500 border-4 border-black text-black mx-auto flex items-center justify-center text-3xl font-extrabold animate-bounce shadow-[4px_4px_0px_#00ffff]">
                          ✓
                        </div>
                        <div>
                          <h4 className="retro-title text-[11px] text-yellow-300 uppercase">TRANSACTION COMPLETED!</h4>
                          <p className="retro-body text-xl text-white/90 mt-2">
                            Your vintage cartridges are being fetched from our physical vaults! Track your delivery status on our dial-up BBS. Your thermal printout ticket is ready.
                          </p>
                        </div>

                        {/* Traditional Paper Receipt */}
                        <div className="bg-[#fcf8e3] p-4 border-2 border-dashed border-gray-600 text-black space-y-2 font-mono text-left text-xs shadow-md">
                          <p className="retro-title text-[9px] text-center border-b-2 border-black pb-1">
                            OFFICIAL SALES ESTIMATE
                          </p>
                          <p className="retro-tech uppercase">TICKET_ID: RX-{Math.floor(Math.random() * 999999)}</p>
                          <p className="retro-tech uppercase">SYSTEM PORT: SECURE RETRO-PAY</p>
                          <p className="retro-tech uppercase">CARRIER: USPS PARCEL POST</p>
                          <p className="retro-tech text-center mt-3 pt-2 border-t border-black font-extrabold">
                            ★★★ THANK YOU FOR PRESERVING RETRO GAME HISTORY ★★★
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            triggerBeep('victory');
                            setCheckoutStep('idle');
                            setCartOpen(false);
                          }}
                          className="button-90s-green w-full py-2.5 retro-title text-[9px]"
                        >
                          RETURN TO GAME ROOM
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Cart items list */}
                        {cart.length === 0 ? (
                          <div className="text-center py-16 space-y-4">
                            <div className="text-slate-600 text-4xl animate-bounce">🕹️</div>
                            <h4 className="retro-title text-[9px] text-slate-500 uppercase">Cart is Empty</h4>
                            <p className="retro-body text-2xl text-white/60">
                              No cartridges loaded. Click cabinet buttons to earn tokens, then buy epic classic titles!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                            {cart.map((item) => (
                              <div 
                                key={item.game.id}
                                className="bg-black border-2 border-purple-800 p-3 flex gap-3 items-center justify-between"
                              >
                                <div className="w-12 h-12 flex-shrink-0 border border-purple-900 overflow-hidden bg-slate-900">
                                  <img 
                                    src={item.game.image} 
                                    alt={item.game.title} 
                                    className="w-full h-full object-cover filter contrast-[1.1]"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="retro-title text-[8px] text-white uppercase truncate">
                                    {item.game.title}
                                  </h4>
                                  <p className="text-[12px] text-yellow-300 retro-tech mt-0.5 font-bold">
                                    ${item.game.price.toFixed(2)} x {item.quantity}
                                  </p>
                                </div>

                                {/* Increments */}
                                <div className="flex items-center gap-1.5">
                                  <button 
                                    onClick={() => handleDecQuantity(item.game.id)}
                                    className="w-6 h-6 bg-slate-900 border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="retro-tech text-sm text-white font-extrabold px-1 min-w-[12px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => handleAddToCart(item.game)}
                                    className="w-6 h-6 bg-slate-900 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Pricing and checkout section */}
                  {cart.length > 0 && checkoutStep === 'idle' && (
                    <div className="border-t-4 border-pink-600 pt-4 space-y-4">
                      
                      <div className="bg-slate-950 p-3 space-y-1 text-xs retro-tech">
                        <div className="flex justify-between text-white/70">
                          <span>CART SUBTOTAL:</span>
                          <span>${rawSubtotal.toFixed(2)}</span>
                        </div>
                        
                        {couponActive && (
                          <div className="flex justify-between text-green-400 font-extrabold">
                            <span>25% COUPON DISCOUNT:</span>
                            <span>-${discount.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-white/70">
                          <span>SHIPPING METHOD:</span>
                          <span className="text-green-400 font-bold">FREE PARCEL DISPATCH</span>
                        </div>

                        <div className="flex justify-between text-sm text-yellow-300 font-bold border-t border-slate-900 pt-1.5 mt-1.5">
                          <span className="retro-title text-[8px] text-yellow-300 glow-yellow-text">EST. GRAND TOTAL:</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Redeem Token Call-To-Action */}
                      {!couponActive && (
                        <div className="bg-black border border-yellow-400 p-2 text-center">
                          <p className="text-[9px] text-yellow-300 retro-tech uppercase tracking-wide">
                            💡 NEED SAVINGS? INSERT 30 COINS ON CABINET IN EXCHANGE FOR A 25% DISCOUNT TICKET!
                          </p>
                        </div>
                      )}

                      {/* Checkout button */}
                      <button
                        onClick={handleCheckout}
                        className="button-90s-green w-full py-3.5 retro-title text-[10px] font-extrabold text-black uppercase"
                      >
                        🚀 PROCESS CHECKOUT DISPATCH ($ {totalCost.toFixed(2)})
                      </button>

                      <p className="text-[9px] text-center text-slate-500 uppercase retro-tech">
                        * All credit operations are secure, simulated and purely nostalgic.
                      </p>
                    </div>
                  )}

                </motion.div>
              </div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}