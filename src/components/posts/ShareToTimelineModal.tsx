import React, { useState } from 'react';
import { X, Users, Share, Image } from 'lucide-react';
import { postInteractionService } from '../../services/PostInteractionService';
import { toast } from '../ui/Toast';

interface Post {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  images?: string[];
}

interface ShareToTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  userToken: string;
  onShareSuccess?: () => void;
}

export const ShareToTimelineModal: React.FC<ShareToTimelineModalProps> = ({
  isOpen,
  onClose,
  post,
  userToken,
  onShareSuccess
}) => {
  const [shareText, setShareText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setLoading(true);
    
    try {
      const result = await postInteractionService.sharePost(
        post.id,
        { 
          share_type: 'timeline',
          share_text: shareText.trim() || undefined
        },
        userToken
      );

      if (result.success) {
        toast.success('Post compartilhado na sua timeline!');
        onShareSuccess?.();
        onClose();
      } else {
        toast.error(result.message || 'Erro ao compartilhar post');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao compartilhar post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Compartilhar na Timeline
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Share Text Input */}
            <div className="p-4 border-b border-gray-100">
              <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Escreva algo sobre este post..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {shareText.length}/500 caracteres
                </span>
              </div>
            </div>

            {/* Original Post Preview */}
            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Post Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {post.user.avatar ? (
                      <img 
                        src={post.user.avatar} 
                        alt={post.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {post.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                    <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-3">
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="space-y-2">
                    {post.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-auto rounded-lg object-cover max-h-64"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compartilhando...</span>
                  </>
                ) : (
                  <>
                    <Share className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareToTimelineModal;
