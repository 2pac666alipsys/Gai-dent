import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GaiadentMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isAnimated?: boolean;
  withBubble?: boolean;
  bubbleText?: string;
  onClick?: () => void;
  interactive?: boolean;
  bubblePosition?: 'top' | 'bottom' | 'left' | 'right';
  title?: string;
  drag?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
}

export default function GaiadentMascot({
  size = 'md',
  className = '',
  isAnimated = true,
  withBubble = false,
  bubbleText,
  onClick,
  interactive = true,
  bubblePosition = 'bottom',
  title,
  drag = false
}: GaiadentMascotProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [customQuote, setCustomQuote] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36'
  };

  // Newly generated anime-style avatar path
  const imageSrc = new URL('../assets/images/gayita_avatar_1782957756686.jpg', import.meta.url).href;

  // Array of cute quotes by Gayita when clicked
  const gayitaQuotes = [
    '¡Hola! Soy Gäyita. ¿Listo para cuidar tu hermosa sonrisa hoy? ✨',
    '¡Qué alegría verte! Recuerda cepillarte los dientes 3 veces al día. 🪥',
    'Gaiädent Oruro tiene los mejores insumos importados de odontología. 🇧🇴',
    '¿Tienes dudas sobre algún pedido? Pregúntame en el chat de Gäyita IA. 🤖',
    'La odontología es el arte de esculpir sonrisas felices. 😁',
    '¡Sonríe! Es tu mejor presentación hoy. 🌸',
    '¡Hacemos entregas ultra-rápidas en toda la ciudad de Oruro! 🚀'
  ];

  // Cute Web Audio API synthesizer sound effect for interactive feedback
  const playCuteSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // First high tone (pop)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(600, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      // Second harmonizing tone a tiny bit later
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(900, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
        
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.1);
      }, 50);

    } catch (e) {
      // Audio failed or context blocked
    }
  };

  const triggerInteraction = (e: React.MouseEvent) => {
    if (!interactive) return;

    playCuteSound();

    // Create a burst of cute floating particles
    const emojis = ['✨', '🌸', '🦷', '💖', '⭐', '🍀'];
    const newParticles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 40,
      y: -20 - Math.random() * 30,
      char: emojis[Math.floor(Math.random() * emojis.length)]
    }));

    setParticles(prev => [...prev, ...newParticles].slice(-15));

    // Show a randomized message
    const quoteIndex = clickCount % gayitaQuotes.length;
    setCustomQuote(gayitaQuotes[quoteIndex]);
    setClickCount(prev => prev + 1);

    // Call external handler if provided
    if (onClick) {
      onClick();
    }
  };

  // Clear customized quote after some seconds
  useEffect(() => {
    if (customQuote) {
      const timer = setTimeout(() => {
        setCustomQuote(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [customQuote]);

  // Handle particle lifespan
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const animationProps = isAnimated
    ? {
        animate: {
          y: [0, -6, 0],
          rotate: [0, 1.5, -1.5, 0]
        },
        transition: {
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    : {};

  const displayBubbleText = customQuote || bubbleText || '¡Hola! Soy Gäyita. Haz clic en mí para conversar ✨';

  return (
    <motion.div
      title={title}
      drag={drag}
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.1, zIndex: 999 }}
      className={`flex flex-col items-center justify-center relative ${drag ? 'cursor-grab active:cursor-grabbing touch-none select-none' : ''} ${className}`}
    >
      <div className="relative">
        
        {/* Floating particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 1.2, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute pointer-events-none text-xs z-30"
            >
              {p.char}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Outer glowing pulsing aura */}
        {isAnimated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md pointer-events-none z-0"
            animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Interactive Avatar Base Container */}
        <motion.div
          onClick={triggerInteraction}
          whileHover={interactive ? { scale: 1.08, rotate: 2 } : {}}
          whileTap={interactive ? { scale: 0.93 } : {}}
          className={`${sizeClasses[size]} overflow-hidden rounded-full border-4 border-emerald-100 bg-white p-0.5 shadow-lg flex items-center justify-center relative z-10 cursor-pointer transition-all duration-300 group`}
          {...animationProps}
        >
          {/* Circular color background to highlight Gayita */}
          <div className="absolute inset-0 bg-emerald-50/40 rounded-full group-hover:bg-emerald-50/70 transition-colors pointer-events-none" />

          {/* Main mascot image with reliable SVG backup */}
          <img
            src={imageSrc}
            alt="Gaiädent Mascot Gayita"
            className="w-full h-full object-cover rounded-full relative z-10"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // If image fails, replace with high quality inline SVG
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const svgContainer = document.createElement('div');
                svgContainer.className = 'w-full h-full flex items-center justify-center relative z-10';
                svgContainer.innerHTML = `
                  <svg viewBox="0 0 100 100" class="w-11/12 h-11/12 text-emerald-500" fill="currentColor">
                    <path d="M50 90C45 90 40 85 38 80C34 70 25 50 25 35C25 22 36 12 50 12C64 12 75 22 75 35C75 50 66 70 62 80C60 85 55 90 50 90Z" fill="#F0FDF4" stroke="#10B981" stroke-width="4"/>
                    <path d="M35 70C38 82 43 88 50 88C57 88 62 82 65 70" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="42" cy="38" r="4" fill="#065F46"/>
                    <circle cx="58" cy="38" r="4" fill="#065F46"/>
                    <path d="M44 48C44 52 56 52 56 48" fill="none" stroke="#065F46" stroke-width="3" stroke-linecap="round"/>
                    <path d="M36 34C38 32 44 34 44 34" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
                    <path d="M64 34C62 32 56 34 56 34" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                `;
                parent.appendChild(svgContainer);
              }
            }}
          />
        </motion.div>

        {/* Dynamic sparkling stars around the mascot */}
        {isAnimated && (
          <>
            <motion.div
              className="absolute -top-1.5 -right-1.5 text-emerald-400 font-bold text-sm pointer-events-none z-20"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8], rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.div>
            <motion.div
              className="absolute -bottom-1.5 -left-1.5 text-amber-400 font-bold text-sm pointer-events-none z-20"
              animate={{ opacity: [1, 0.2, 1], scale: [1.3, 0.8, 1.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ★
            </motion.div>
          </>
        )}
      </div>

      {/* Interactive Speech Bubble */}
      {(withBubble || customQuote) && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.8, 
            x: bubblePosition === 'left' ? 10 : bubblePosition === 'right' ? -10 : '-50%',
            y: bubblePosition === 'top' ? 10 : bubblePosition === 'bottom' ? -10 : '-50%' 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: (bubblePosition === 'top' || bubblePosition === 'bottom') ? '-50%' : '0%',
            y: (bubblePosition === 'left' || bubblePosition === 'right') ? '-50%' : '0%' 
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`relative bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 shadow-md text-center font-medium z-30 max-h-24 overflow-y-auto ${
            bubblePosition === 'top' ? 'absolute bottom-full mb-3 left-1/2 w-48 sm:w-56' :
            bubblePosition === 'bottom' ? 'absolute top-full mt-3 left-1/2 w-48 sm:w-56' :
            bubblePosition === 'left' ? 'absolute right-full mr-3 top-1/2 w-48 sm:w-56' :
            'absolute left-full ml-3 top-1/2 w-48 sm:w-56'
          }`}
        >
          {/* Speech bubble arrow */}
          <div className={
            bubblePosition === 'top' ? 'absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-50 border-r border-b border-emerald-100 rotate-45' :
            bubblePosition === 'bottom' ? 'absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-50 border-l border-t border-emerald-100 rotate-45' :
            bubblePosition === 'left' ? 'absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-50 border-r border-t border-emerald-100 rotate-45' :
            'absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-50 border-l border-b border-emerald-100 rotate-45'
          }></div>
          <span className="leading-relaxed block relative z-10">{displayBubbleText}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
