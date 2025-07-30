import React, { useEffect } from 'react';
import { toast } from '../ui/Toast';

interface PostInteractionHandlerProps {
  userToken: string;
  userId: number;
}

export const PostInteractionHandler: React.FC<PostInteractionHandlerProps> = ({
  userToken,
  userId
}) => {
  useEffect(() => {
    // Escutar eventos de interação em posts
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      
      if (notification.type === 'post_reaction') {
        const { sender, data } = notification;
        if (data.user_id !== userId) { // Não mostrar para o próprio usuário
          toast.success(`${sender.first_name} curtiu seu post!`);
        }
      } else if (notification.type === 'post_comment') {
        const { sender, data } = notification;
        if (data.user_id !== userId) {
          toast.success(`${sender.first_name} comentou em seu post!`);
        }
      } else if (notification.type === 'post_share') {
        const { sender, data } = notification;
        if (data.user_id !== userId) {
          toast.success(`${sender.first_name} compartilhou seu post!`);
        }
      }
    };

    // Adicionar listener para notificações
    window.addEventListener('newNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
    };
  }, [userId]);

  return null; // Este componente não renderiza nada visível
};

export default PostInteractionHandler;
