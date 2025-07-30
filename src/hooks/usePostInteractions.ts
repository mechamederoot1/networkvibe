import { useState, useCallback } from 'react';
import { postInteractionService } from '../services/PostInteractionService';
import { toast } from '../components/ui/Toast';

interface UsePostInteractionsProps {
  userToken: string;
  onInteractionSuccess?: () => void;
}

export const usePostInteractions = ({ userToken, onInteractionSuccess }: UsePostInteractionsProps) => {
  const [loading, setLoading] = useState(false);

  const handleReaction = useCallback(async (
    postId: number, 
    reactionType: string, 
    currentReaction: string | null
  ) => {
    setLoading(true);
    
    try {
      let result;
      
      if (currentReaction === reactionType) {
        // Remover reação se for a mesma
        result = await postInteractionService.removePostReaction(postId, userToken);
      } else {
        // Adicionar/trocar reação
        result = await postInteractionService.togglePostReaction(postId, reactionType, userToken);
      }

      if (result.success) {
        onInteractionSuccess?.();
        return {
          success: true,
          newReaction: currentReaction === reactionType ? null : reactionType,
          data: result.data
        };
      } else {
        toast.error(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Erro na reação:', error);
      toast.error('Erro ao processar reação');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userToken, onInteractionSuccess]);

  const handleComment = useCallback(async (
    postId: number, 
    content: string, 
    parentId?: number
  ) => {
    if (!content.trim()) {
      toast.error('Comentário não pode estar vazio');
      return { success: false };
    }

    setLoading(true);

    try {
      const result = await postInteractionService.addComment({
        content: content.trim(),
        post_id: postId,
        parent_id: parentId
      }, userToken);

      if (result.success) {
        onInteractionSuccess?.();
        toast.success('Comentário adicionado!');
        return {
          success: true,
          data: result.data
        };
      } else {
        toast.error(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Erro ao comentar:', error);
      toast.error('Erro ao adicionar comentário');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userToken, onInteractionSuccess]);

  const handleShare = useCallback(async (
    postId: number, 
    shareType: 'timeline' | 'message' | 'copy'
  ) => {
    setLoading(true);

    try {
      if (shareType === 'copy') {
        const url = `${window.location.origin}/post/${postId}`;
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência!');
        return { success: true };
      }

      const result = await postInteractionService.sharePost(postId, { share_type: shareType }, userToken);

      if (result.success) {
        onInteractionSuccess?.();
        
        switch (shareType) {
          case 'timeline':
            toast.success('Post compartilhado na sua timeline!');
            break;
          case 'message':
            toast.success('Post compartilhado nas mensagens!');
            break;
        }

        return {
          success: true,
          data: result.data
        };
      } else {
        toast.error(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao compartilhar post');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userToken, onInteractionSuccess]);

  const handleBookmark = useCallback(async (postId: number) => {
    setLoading(true);

    try {
      const result = await postInteractionService.toggleBookmark(postId, userToken);

      if (result.success) {
        onInteractionSuccess?.();
        toast.success(result.message);
        return {
          success: true,
          isBookmarked: result.data?.bookmarked,
          data: result.data
        };
      } else {
        toast.error(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar post');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userToken, onInteractionSuccess]);

  const handleLikeComment = useCallback(async (commentId: number) => {
    setLoading(true);

    try {
      const result = await postInteractionService.likeComment(commentId, userToken);

      if (result.success) {
        onInteractionSuccess?.();
        return {
          success: true,
          data: result.data
        };
      } else {
        toast.error(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      toast.error('Erro ao curtir comentário');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userToken, onInteractionSuccess]);

  const handleCommentReaction = useCallback(async (
    commentId: number,
    reactionType: string,
    currentReaction: string | null
  ) => {
    setLoading(true);

    try {
      let result;

      if (currentReaction === reactionType) {
        // Remover reação se for a mesma
        result = await postInteractionService.removeCommentReaction(commentId, userToken);
      } else {
        // Adicionar/trocar reação
        result = await postInteractionService.toggleCommentReaction(commentId, reactionType, userToken);
      }

      if (result.success) {
        onInteractionSuccess?.();
        return {
          success: true,
          newReaction: currentReaction === reactionType ? null : reactionType,
          data: result.data
        };
      } else {
        toast.error(result.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Erro na reação do comentário:', error);
      toast.error('Erro ao processar reação do comentário');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [userToken, onInteractionSuccess]);

  return {
    loading,
    handleReaction,
    handleComment,
    handleShare,
    handleBookmark,
    handleLikeComment,
    handleCommentReaction
  };
};

export default usePostInteractions;
