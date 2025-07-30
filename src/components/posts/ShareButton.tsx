import React, { useState } from 'react';
import { Share, Users, Copy, MessageCircle } from 'lucide-react';
import { postInteractionService } from '../../services/PostInteractionService';
import { toast } from '../ui/Toast';

interface ShareButtonProps {
  postId: number;
  userToken: string;
  initialSharesCount?: number;
  onShareSuccess?: (newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const shareOptions = [
  {
    type: 'timeline',
    icon: Users,
    label: 'Compartilhar na Timeline',
    description: 'Compartilhe com seus amigos',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    type: 'message',
    icon: MessageCircle,
    label: 'Enviar por Mensagem',
    description: 'Envie para alguém específico',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    type: 'copy',
    icon: Copy,
    label: 'Copiar Link',
    description: 'Copie o link do post',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
];

export const ShareButton: React.FC<ShareButtonProps> = ({
  postId,
  userToken,
  initialSharesCount = 0,
  onShareSuccess,
  size = 'md'
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharesCount, setSharesCount] = useState(initialSharesCount);
  const [loading, setLoading] = useState(false);

  const handleShare = async (shareType: string) => {
    setLoading(true);
    
    try {
      if (shareType === 'copy') {
        const url = `${window.location.origin}/post/${postId}`;
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência!');
        setShowShareModal(false);
        return;
      }



      // Para timeline e message, fazer requisição ao backend
      const result = await postInteractionService.sharePost(
        postId, 
        { share_type: shareType as 'timeline' | 'message' }, 
        userToken
      );

      if (result.success) {
        setSharesCount(prev => prev + 1);
        onShareSuccess?.(sharesCount + 1);
        
        switch (shareType) {
          case 'timeline':
            toast.success('Post compartilhado na sua timeline!');
            break;
          case 'message':
            toast.success('Abrindo mensagens para compartilhar...');
            // Aqui poderia abrir um modal de seleção de contatos
            break;
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao compartilhar post');
    } finally {
      setLoading(false);
      setShowShareModal(false);
    }
  };

  const buttonSize = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }[size];

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }[size];

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareModal(!showShareModal)}
        disabled={loading}
        className={`flex items-center space-x-2 ${buttonSize} text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Share className={iconSize} />
        <span>Compartilhar</span>
        {sharesCount > 0 && (
          <span className="text-xs opacity-75">({sharesCount})</span>
        )}
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setShowShareModal(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-40 animate-in fade-in zoom-in duration-200">
            <div className="px-4 pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Share className="w-5 h-5 mr-2" />
                Compartilhar Post
              </h3>
            </div>
            
            <div className="py-2">
              {shareOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleShare(option.type)}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className={`p-2 rounded-lg ${option.bgColor}`}>
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="px-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {sharesCount} {sharesCount === 1 ? 'compartilhamento' : 'compartilhamentos'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
