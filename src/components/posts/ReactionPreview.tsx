import React from 'react';
import { ModernEmoji } from '../ui/ModernEmoji';

interface ReactionPreviewProps {
  reactions: Array<{
    type: string;
    count: number;
  }>;
  totalCount: number;
  onClick?: () => void;
}

// Tipos válidos para o ModernEmoji
type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const ReactionPreview: React.FC<ReactionPreviewProps> = ({
  reactions,
  totalCount,
  onClick
}) => {
  // Pegar os 3 tipos de reação mais populares
  const topReactions = reactions
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (totalCount === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1 hover:underline text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      {/* Emojis das reações */}
      <div className="flex -space-x-1">
        {topReactions.map((reaction, index) => (
          <div
            key={reaction.type}
            className="inline-block bg-white rounded-full border-2 border-white shadow-sm"
            style={{ zIndex: topReactions.length - index }}
          >
            <ModernEmoji
              type={reaction.type as ReactionType}
              size="sm"
              animated={false}
            />
          </div>
        ))}
      </div>
      
      {/* Contador */}
      <span>
        {totalCount} {totalCount === 1 ? "reação" : "reações"}
      </span>
    </button>
  );
};

export default ReactionPreview;
