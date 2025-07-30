import React, { useState, useEffect } from 'react';
import { ModernEmoji } from '../ui/ModernEmoji';
import { postInteractionService } from '../../services/PostInteractionService';

interface CommentReactionProps {
  commentId: number;
  userToken: string;
  initialReactionsCount?: number;
  onReactionChange?: (newCount: number) => void;
  size?: 'sm' | 'md';
}

const reactionTypes = [
  { type: 'like' as const, color: 'text-blue-500', label: 'Curtir', bgColor: 'bg-blue-50' },
  { type: 'love' as const, color: 'text-red-500', label: 'Amei', bgColor: 'bg-red-50' },
  { type: 'haha' as const, color: 'text-yellow-500', label: 'Haha', bgColor: 'bg-yellow-50' },
  { type: 'wow' as const, color: 'text-purple-500', label: 'Uau', bgColor: 'bg-purple-50' },
  { type: 'sad' as const, color: 'text-gray-500', label: 'Triste', bgColor: 'bg-gray-50' },
  { type: 'angry' as const, color: 'text-red-600', label: 'Raiva', bgColor: 'bg-red-50' },
];

export const CommentReaction: React.FC<CommentReactionProps> = ({
  commentId,
  userToken,
  initialReactionsCount = 0,
  onReactionChange,
  size = 'sm'
}) => {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionsCount, setReactionsCount] = useState(initialReactionsCount);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Buscar reação do usuário atual
  useEffect(() => {
    const fetchUserReaction = async () => {
      try {
        const data = await postInteractionService.getUserCommentReaction(commentId, userToken);
        if (data && data.reaction) {
          setUserReaction(data.reaction.reaction_type);
        }
      } catch (error) {
        console.error("Erro ao buscar reação do usuário no comentário:", error);
      }
    };

    if (userToken && commentId) {
      fetchUserReaction();
    }
  }, [commentId, userToken]);

  const handleReaction = async (reactionType: string) => {
    if (loading) return;
    
    setLoading(true);
    setShowReactionPicker(false);
    
    try {
      let result;
      
      if (userReaction === reactionType) {
        // Remover reação se for a mesma
        result = await postInteractionService.removeCommentReaction(commentId, userToken);
        if (result.success) {
          setUserReaction(null);
          setReactionsCount(prev => Math.max(0, prev - 1));
          onReactionChange?.(Math.max(0, reactionsCount - 1));
        }
      } else {
        // Adicionar/trocar reação
        result = await postInteractionService.toggleCommentReaction(commentId, reactionType, userToken);
        if (result.success) {
          const wasReacted = userReaction !== null;
          setUserReaction(reactionType);
          setReactionsCount(prev => wasReacted ? prev : prev + 1);
          onReactionChange?.(wasReacted ? reactionsCount : reactionsCount + 1);
        }
      }
    } catch (error) {
      console.error("Erro ao reagir ao comentário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnterReaction = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowReactionPicker(true);
  };

  const handleMouseLeaveReaction = () => {
    const timeout = setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const getCurrentReactionData = () => {
    return userReaction 
      ? reactionTypes.find(r => r.type === userReaction)
      : null;
  };

  const reactionData = getCurrentReactionData();

  const buttonSize = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const emojiSize = size === 'sm' ? 'sm' : 'md';

  return (
    <div className="relative inline-block">
      <div 
        className="relative"
        onMouseEnter={handleMouseEnterReaction}
        onMouseLeave={handleMouseLeaveReaction}
      >
        <button
          onClick={() => handleReaction(userReaction || "like")}
          disabled={loading}
          className={`flex items-center space-x-1 ${buttonSize} rounded-lg transition-all duration-200 ${
            userReaction
              ? `${reactionData?.bgColor} ${reactionData?.color} border`
              : "text-gray-500 hover:bg-gray-50 hover:text-blue-500"
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>...</span>
            </>
          ) : (
            <>
              {reactionData ? (
                <ModernEmoji type={reactionData.type} size={emojiSize} animated={false} />
              ) : (
                <ModernEmoji type="like" size={emojiSize} animated={false} />
              )}
              <span>{reactionData?.label || "Curtir"}</span>
              {reactionsCount > 0 && (
                <span className="text-xs opacity-75">({reactionsCount})</span>
              )}
            </>
          )}
        </button>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <div 
            className="absolute bottom-full left-0 mb-2 rounded-xl shadow-xl border border-gray-200/50 px-2 py-1.5 flex space-x-1 z-20 animate-in fade-in zoom-in duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {reactionTypes.map((reaction, index) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className={`relative p-2 rounded-xl transition-all duration-200 group ${
                  userReaction === reaction.type 
                    ? 'scale-110 ring-2 ring-blue-400/50 shadow-lg' 
                    : 'hover:scale-125 hover:shadow-lg'
                }`}
                title={reaction.label}
                style={{
                  animationDelay: `${index * 30}ms`,
                  background: userReaction === reaction.type 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
                    : 'transparent'
                }}
              >
                <ModernEmoji 
                  type={reaction.type} 
                  size="md" 
                  animated={true}
                  className="group-hover:scale-110"
                />
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {reaction.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cleanup timeout on unmount */}
      {React.useEffect(() => {
        return () => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
          }
        };
      }, [hoverTimeout]) && null}
    </div>
  );
};

export default CommentReaction;
