import { motion } from 'motion/react';

interface GaiadentMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isAnimated?: boolean;
  withBubble?: boolean;
  bubbleText?: string;
}

export default function GaiadentMascot({
  size = 'md',
  className = '',
  isAnimated = true,
  withBubble = false,
  bubbleText = '¡Hola! Soy Gäyita, tu asistente dental. ¿Cómo puedo ayudarte hoy?'
}: GaiadentMascotProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36'
  };

  // Pre-determined generated image path
  const imageSrc = '/src/assets/images/luffy_launcher_icon_1782877105670.jpg';

  const animationProps = isAnimated
    ? {
        animate: {
          y: [0, -6, 0]
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    : {};

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} overflow-hidden rounded-full border-4 border-emerald-100 bg-white p-1 shadow-md flex items-center justify-center`}
          {...animationProps}
        >
          {/* Main mascot image with reliable SVG backup */}
          <img
            src={imageSrc}
            alt="Gaiädent Mascot"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // If image fails, replace with a high quality inline SVG Tooth caricature
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const svgContainer = document.createElement('div');
                svgContainer.className = 'w-full h-full flex items-center justify-center';
                svgContainer.innerHTML = `
                  <svg viewBox="0 0 100 100" class="w-11/12 h-11/12 text-emerald-500" fill="currentColor">
                    <path d="M50 90C45 90 40 85 38 80C34 70 25 50 25 35C25 22 36 12 50 12C64 12 75 22 75 35C75 50 66 70 62 80C60 85 55 90 50 90Z" fill="#F0FDF4" stroke="#10B981" stroke-width="4"/>
                    <!-- Roots -->
                    <path d="M35 70C38 82 43 88 50 88C57 88 62 82 65 70" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
                    <!-- Face -->
                    <circle cx="42" cy="38" r="4" fill="#065F46"/>
                    <circle cx="58" cy="38" r="4" fill="#065F46"/>
                    <path d="M44 48C44 52 56 52 56 48" fill="none" stroke="#065F46" stroke-width="3" stroke-linecap="round"/>
                    <path d="M36 34C38 32 44 34 44 34" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
                    <path d="M64 34C62 32 56 34 56 34" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
                    <!-- Sparkles -->
                    <path d="M22 18L24 22L28 20L25 17L22 18Z" fill="#34D399"/>
                    <path d="M78 18L76 22L72 20L75 17L78 18Z" fill="#34D399"/>
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
              className="absolute -top-1 -right-1 text-emerald-400 font-bold text-xs"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              ✦
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-1 text-mint-400 font-bold text-xs"
              animate={{ opacity: [1, 0.2, 1], scale: [1.2, 0.8, 1.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ✦
            </motion.div>
          </>
        )}
      </div>

      {withBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-3 relative bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-800 max-w-xs shadow-sm text-center font-medium"
        >
          {/* Speech bubble arrow */}
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-emerald-50 border-t border-l border-emerald-100 rotate-45"></div>
          {bubbleText}
        </motion.div>
      )}
    </div>
  );
}
