import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Users } from 'lucide-react';

interface PostStatsProps {
  postId: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  userToken: string;
  onToggleComments?: () => void;
}

interface ReactionUser {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  reaction_type: string;
}

export const PostStats: React.FC<PostStatsProps> = ({
  postId,
  likesCount,
  commentsCount,
  sharesCount,
  userToken,
  onToggleComments
}) => {
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [reactionUsers, setReactionUsers] = useState<ReactionUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReactionUsers = async () => {
    if (reactionUsers.length > 0) {
      setShowReactionUsers(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/posts/${postId}/reactions/users`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const users = await response.json();
        setReactionUsers(users);
        setShowReactionUsers(true);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários que reagiram:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReactionEmoji = (reactionType: string) => {
    switch (reactionType) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100">
      {/* Estatísticas principais */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {likesCount > 0 && (
            <button
              onClick={fetchReactionUsers}
              disabled={loading}
              className="hover:underline flex items-center space-x-1"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>
                {likesCount} {likesCount === 1 ? "reação" : "reações"}
              </span>
            </button>
          )}
          
          {commentsCount > 0 && (
            <button
              onClick={onToggleComments}
              className="hover:underline flex items-center space-x-1"
            >
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span>
                {commentsCount} {commentsCount === 1 ? "comentário" : "comentários"}
              </span>
            </button>
          )}
          
          {sharesCount > 0 && (
            <div className="flex items-center space-x-1">
              <Share className="w-4 h-4 text-green-500" />
              <span>
                {sharesCount} {sharesCount === 1 ? "compartilhamento" : "compartilhamentos"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal com usuários que reagiram */}
      {showReactionUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Heart className="w-5 h-5 text-red-500 mr-2" />
                Reações
              </h3>
              <button
                onClick={() => setShowReactionUsers(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {reactionUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {loading ? 'Carregando...' : 'Nenhuma reação ainda'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reactionUsers.map((user) => (
                    <div key={`${user.id}-${user.reaction_type}`} className="p-3 flex items-center space-x-3">
                      <img
                        src={
                          user.avatar?.startsWith('http') 
                            ? user.avatar 
                            : user.avatar 
                              ? `http://localhost:8000${user.avatar}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  `${user.first_name} ${user.last_name}`
                                )}&background=3B82F6&color=fff`
                        }
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                      <div className="text-xl">
                        {getReactionEmoji(user.reaction_type)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostStats;
