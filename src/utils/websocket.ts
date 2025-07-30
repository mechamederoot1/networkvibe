/**
 * WebSocket utility with improved error handling and connection management
 */

export interface WebSocketConfig {
  userId: number;
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: string) => void;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isDestroyed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectDelay: 3000,
      ...config,
    };
  }

  connect(): void {
    if (this.isConnecting || this.isDestroyed) return;
    
    this.isConnecting = true;
    
    try {
      const wsUrl = `ws://localhost:8000/ws/${this.config.userId}?token=${encodeURIComponent(this.config.token)}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.config.onConnect?.();
        
        // Send ping to keep connection alive
        this.sendPing();
      };
      
      this.ws.onmessage = (event) => {
        try {
          if (event.data === 'pong') {
            // Handle pong response
            setTimeout(() => this.sendPing(), 30000); // Send ping every 30 seconds
            return;
          }
          
          const data = JSON.parse(event.data);
          this.config.onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.config.onError?.('Failed to parse message from server');
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        this.isConnecting = false;
        this.ws = null;
        this.config.onDisconnect?.();
        
        if (!this.isDestroyed) {
          this.attemptReconnect();
        }
      };
      
      this.ws.onerror = (event) => {
        this.isConnecting = false;
        
        let errorMessage = 'WebSocket connection failed';
        
        if (this.ws) {
          switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
              errorMessage = 'Unable to connect to the server. Please check your internet connection.';
              break;
            case WebSocket.CLOSING:
              errorMessage = 'Connection is being closed.';
              break;
            case WebSocket.CLOSED:
              errorMessage = 'Connection has been closed. Attempting to reconnect...';
              break;
            default:
              errorMessage = 'An unknown WebSocket error occurred.';
          }
        }
        
        console.error('WebSocket error:', {
          message: errorMessage,
          readyState: this.ws?.readyState,
          url: this.ws?.url,
          event: event.type
        });
        
        this.config.onError?.(errorMessage);
      };
      
    } catch (error) {
      this.isConnecting = false;
      const errorMessage = `Failed to create WebSocket connection: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);
      this.config.onError?.(errorMessage);
      this.attemptReconnect();
    }
  }

  private sendPing(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send('ping');
    }
  }

  private attemptReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.log('Max reconnection attempts reached or connection destroyed');
      this.config.onError?.('Unable to maintain connection to the server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = (this.config.reconnectDelay || 3000) * this.reconnectAttempts;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect();
      }
    }, delay);
  }

  disconnect(): void {
    this.isDestroyed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'Not connected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'Connecting';
      case WebSocket.OPEN: return 'Connected';
      case WebSocket.CLOSING: return 'Closing';
      case WebSocket.CLOSED: return 'Closed';
      default: return 'Unknown';
    }
  }
}

export default WebSocketManager;
