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
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-blue-700/20 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-300/20 to-white/10 rounded-full"></div>
              <svg className="w-1/2 h-1/2 text-white relative z-10 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
              </svg>
              {animated && (
                <div className="absolute inset-0 bg-blue-300/20 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        );

      case 'love':
        return (
          <div className={`${baseClasses} ${animated ? 'hover:scale-110 hover:rotate-12' : ''}`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 via-pink-500 to-red-600 shadow-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-red-700/30 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-pink-300/30 to-white/20 rounded-full"></div>
              <svg
                className="w-1/2 h-1/2 text-white relative z-10 drop-shadow-sm"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {animated && (
                <div className="absolute inset-0 bg-pink-300/20 rounded-full animate-pulse"></div>
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
