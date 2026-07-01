import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 600);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div id="splash-screen" className="fixed inset-0 bg-emerald-50 flex flex-col items-center justify-between p-8 z-50">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Launcher icon - Luffy Tooth caricature */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-xl border-4 border-emerald-100 overflow-hidden relative mb-6 flex items-center justify-center p-2"
        >
          <img
            src="/src/assets/images/luffy_launcher_icon_1782877105670.jpg"
            alt="Gaiädent Logo"
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              // High fidelity SVG fallback of Luffy-style tooth caricature
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex flex-col items-center justify-center text-center relative';
                fallback.innerHTML = `
                  <svg viewBox="0 0 100 100" class="w-24 h-24 text-emerald-500" fill="currentColor">
                    <!-- Tooth background -->
                    <path d="M50 85C42 85 36 80 34 72C30 60 22 45 22 32C22 20 32 10 50 10C68 10 78 20 78 32C78 45 70 60 66 72C64 80 58 85 50 85Z" fill="#FFFFFF" stroke="#059669" stroke-width="4"/>
                    
                    <!-- Luffy Straw Hat -->
                    <path d="M15 22C15 22 30 5 50 5C70 5 85 22 85 22C85 22 75 25 50 25C25 25 15 22 15 22Z" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
                    <path d="M22 21C28 23 38 24 50 24C62 24 72 23 78 21" fill="none" stroke="#DC2626" stroke-width="4"/> <!-- Red Ribbon -->
                    
                    <!-- Scar under left eye -->
                    <path d="M60 46L63 50M60 48L64 48" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
                    
                    <!-- Happy Eyes and Smile -->
                    <path d="M34 38C34 38 38 35 42 38" fill="none" stroke="#065F46" stroke-width="3" stroke-linecap="round"/>
                    <path d="M58 38C58 38 62 35 66 38" fill="none" stroke="#065F46" stroke-width="3" stroke-linecap="round"/>
                    
                    <!-- Big open Luffy-style mouth -->
                    <path d="M38 48C38 48 40 58 50 58C60 58 62 48 62 48H38Z" fill="#991B1B" stroke="#065F46" stroke-width="2"/>
                    <path d="M42 54C46 54 48 50 50 50C52 50 54 54 58 54" fill="none" stroke="#F87171" stroke-width="2"/> <!-- Tongue -->
                  </svg>
                  <div class="absolute bottom-1 bg-emerald-600 text-[10px] text-white font-bold px-2 py-0.5 rounded-full scale-90">ICONO OFICIAL</div>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
        </motion.div>

        {/* Main Goddess Logo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-md bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 flex flex-col items-center justify-center relative overflow-hidden"
        >
          {/* Logo background light rays */}
          <div className="absolute inset-0 bg-radial-gradient from-emerald-50/50 to-transparent pointer-events-none"></div>

          <img
            src="/src/assets/images/gaiadent_logo.png"
            alt="Gaiädent Official Logo"
            className="w-64 h-64 object-contain rounded-2xl relative z-10"
            onError={(e) => {
              // High fidelity SVG fallback of Gaiadent Goddess Logo
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-64 h-64 flex flex-col items-center justify-center text-center relative z-10 p-2';
                fallback.innerHTML = `
                  <svg viewBox="0 0 100 100" class="w-40 h-40 text-emerald-800" fill="currentColor">
                    <!-- Floral Crown Wreath -->
                    <circle cx="50" cy="45" r="32" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="3 3"/>
                    <path d="M22 45C18 35 30 20 50 20C70 20 82 35 78 45" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
                    
                    <!-- Mother Earth Figure with green wavy hair -->
                    <path d="M30 75C30 60 38 40 50 40C62 40 70 60 70 75Z" fill="#F0FDF4"/>
                    <path d="M26 48C26 35 34 25 50 25C66 25 74 35 74 48C74 58 70 65 50 65C30 65 26 58 26 48Z" fill="#047857" opacity="0.85"/>
                    <path d="M34 50C34 40 40 32 50 32C60 32 66 40 66 50" fill="none" stroke="#065F46" stroke-width="2"/>

                    <!-- Holding Earth Globe -->
                    <circle cx="50" cy="65" r="18" fill="#3B82F6" stroke="#047857" stroke-width="2"/>
                    <!-- Globe Continents -->
                    <path d="M42 55C45 58 40 64 45 68C48 72 55 70 52 75" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
                    <path d="M55 52C58 55 52 58 56 62C62 60 65 55 60 52" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>

                    <!-- Delicate Face -->
                    <path d="M45 42C48 44 52 44 55 42" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <h1 class="text-2xl font-bold text-emerald-950 tracking-wider font-serif mt-2">Gaiädent</h1>
                  <p class="text-[8px] tracking-widest text-emerald-700 uppercase font-bold mt-1">Salud • Armonía • Sonrisa</p>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
          <h1 className="text-xl font-bold text-emerald-950 mt-4 tracking-wider">
            Gaiädent
          </h1>
          <p className="text-xs text-emerald-700 mt-1 font-medium italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500 animate-spin" />
            Salud · Armonía · Sonrisa
          </p>
        </motion.div>
      </div>

      {/* Loading Progress Bar */}
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden shadow-inner mb-2">
          <motion.div
            className="h-full bg-emerald-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-emerald-800">
          Iniciando sistema... {progress}%
        </span>
        <span className="text-[10px] text-emerald-600 mt-1 text-center">
          Preparado para cobertura nacional • Oruro, Bolivia
        </span>
      </div>
    </div>
  );
}
