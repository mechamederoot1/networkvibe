/**
 * Serviço para gerenciar interações com posts (curtidas, comentários, compartilhamentos)
 */

interface ReactionResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface CommentData {
  content: string;
  post_id: number;
  parent_id?: number;
}

interface ShareData {
  share_type: 'timeline' | 'message' | 'copy';
}

class PostInteractionService {
  private baseUrl = 'http://localhost:8000';

  /**
   * Curtir ou descurtir um post
   */
  async togglePostReaction(postId: number, reactionType: string, token: string): Promise<ReactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction_type: reactionType }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'Reação atualizada com sucesso',
          data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Erro ao processar reação'
        };
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      return {
        success: false,
        message: 'Erro de conexão'
      };
    }
  }

  /**
   * Remover reação de um post
   */
  async removePostReaction(postId: number, token: string): Promise<ReactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/reactions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Reação removida com sucesso'
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          message: data.detail || 'Erro ao remover reação'
        };
      }
    } catch (error) {
      console.error('Erro ao remover reação:', error);
      return {
        success: false,
        message: 'Erro de conexão'
      };
    }
  }

  /**
   * Buscar reação do usuário atual para um post
   */
  async getUserReaction(postId: number, token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/user-reaction`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar reação do usuário:', error);
      return null;
    }
  }

  /**
   * Adicionar comentário a um post
   */
  async addComment(commentData: CommentData, token: string): Promise<ReactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Comentário adicionado com sucesso',
          data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Erro ao adicionar comentário'
        };
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return {
        success: false,
        message: 'Erro de conexão'
      };
    }
  }

  /**
   * Buscar comentários de um post
   */
  async getPostComments(postId: number, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      return [];
    }
  }

  /**
   * Curtir comentário
   */
  async likeComment(commentId: number, token: string): Promise<ReactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction_type: 'like' }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Comentário curtido',
          data
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          message: data.detail || 'Erro ao curtir comentário'
        };
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      return {
        success: false,
        message: 'Erro de conexão'
      };
    }
  }

  /**
   * Compartilhar post
   */
  async sharePost(postId: number, shareData: ShareData, token: string): Promise<ReactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shareData),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Post compartilhado com sucesso',
          data
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          message: data.detail || 'Erro ao compartilhar post'
        };
      }
    } catch (error) {
      console.error('Erro ao compartilhar post:', error);
      return {
        success: false,
        message: 'Erro de conexão'
      };
    }
  }

  /**
   * Salvar/dessalvar post (bookmark)
   */
  async toggleBookmark(postId: number, token: string): Promise<ReactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.bookmarked ? 'Post salvo' : 'Post removido dos salvos',
          data
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          message: data.detail || 'Erro ao salvar/remover post'
        };
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      return {
        success: false,
        message: 'Erro de conexão'
      };
    }
  }
}

export const postInteractionService = new PostInteractionService();
export default postInteractionService;
