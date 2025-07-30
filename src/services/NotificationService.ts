import WebSocketManager from '../utils/websocket';

class NotificationService {
  private wsManager: WebSocketManager | null = null;
  private listeners: ((notification: any) => void)[] = [];
  private isConnected = false;

  connect(userId: number, token: string) {
    if (this.wsManager) {
      this.wsManager.disconnect();
    }

    this.wsManager = new WebSocketManager({
      userId,
      token,
      onConnect: () => {
        console.log('✅ Notification service connected');
        this.isConnected = true;
      },
      onDisconnect: () => {
        console.log('❌ Notification service disconnected');
        this.isConnected = false;
      },
      onMessage: (data: any) => {
        if (data.type === 'notification') {
          this.notifyListeners(data);
        }
      },
      onError: (error: string) => {
        console.error('🔥 Notification service error:', error);
        this.isConnected = false;
      },
      maxReconnectAttempts: 5,
      reconnectDelay: 3000
    });

    this.wsManager.connect();
  }

  disconnect() {
    if (this.wsManager) {
      this.wsManager.disconnect();
      this.wsManager = null;
    }
    this.isConnected = false;
  }

  addListener(callback: (notification: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(notification: any) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.isConnected && this.wsManager?.isConnected() === true;
  }
}

export const notificationService = new NotificationService();
