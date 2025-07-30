import React from 'react';

interface ModernEmojiProps {
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-10 h-10'
};

export const ModernEmoji: React.FC<ModernEmojiProps> = ({ 
  type, 
  size = 'md', 
  animated = true,
  className = '' 
}) => {
  const baseClasses = `${sizeMap[size]} relative inline-block ${animated ? 'transition-all duration-300' : ''} ${className}`;

  const renderEmoji = () => {
    switch (type) {
      case 'like':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
              <div className="text-white font-bold relative z-10" style={{ fontSize: size === 'xl' ? '1.5rem' : size === 'lg' ? '1.2rem' : '0.8rem' }}>
                👍
              </div>
              {animated && (
                <div className="absolute inset-0 bg-blue-300/30 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
          </div>
        );

      case 'love':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110 hover:rotate-12' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-pink-600 shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
              <svg 
                className="w-1/2 h-1/2 text-white relative z-10" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {animated && (
                <div className="absolute inset-0 bg-pink-300/30 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        );

      case 'haha':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110 hover:rotate-6' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {/* Olhos */}
                <div className="flex space-x-1 mb-0.5">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                {/* Boca sorrindo */}
                <div className="w-2 h-1 border-2 border-black rounded-full border-t-transparent"></div>
              </div>
              {animated && (
                <div className="absolute inset-0 bg-yellow-300/30 rounded-full animate-bounce"></div>
              )}
            </div>
          </div>
        );

      case 'wow':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {/* Olhos arregalados */}
                <div className="flex space-x-1 mb-0.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full border border-black"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full border border-black"></div>
                </div>
                {/* Boca de surpresa */}
                <div className="w-1 h-1.5 bg-black rounded-full"></div>
              </div>
              {animated && (
                <div className="absolute inset-0 bg-purple-300/30 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        );

      case 'sad':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {/* Olhos tristes */}
                <div className="flex space-x-1 mb-0.5">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                {/* Lágrima */}
                <div className="absolute top-1/3 left-1/3 w-0.5 h-1 bg-blue-400 rounded-full"></div>
                {/* Boca triste */}
                <div className="w-2 h-1 border-2 border-black rounded-full border-b-transparent transform rotate-180"></div>
              </div>
              {animated && (
                <div className="absolute inset-0 bg-gray-300/30 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        );

      case 'angry':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110 hover:rotate-3' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {/* Sobrancelhas franzidas */}
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  <div className="w-1 h-0.5 bg-black transform rotate-12"></div>
                  <div className="w-1 h-0.5 bg-black transform -rotate-12"></div>
                </div>
                {/* Olhos bravos */}
                <div className="flex space-x-1 mb-0.5 mt-1">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                {/* Boca brava */}
                <div className="w-2 h-0.5 bg-black rounded-full"></div>
              </div>
              {animated && (
                <div className="absolute inset-0 bg-red-300/30 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderEmoji();
};

export default ModernEmoji;
