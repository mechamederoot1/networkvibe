/**
 * Centralized error handling system
 */

export interface ErrorInfo {
  message: string;
  type: 'network' | 'websocket' | 'api' | 'validation' | 'unknown';
  details?: any;
  timestamp: Date;
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private listeners: ((error: ErrorInfo) => void)[] = [];
  private maxErrors = 50; // Keep last 50 errors

  /**
   * Log an error and notify listeners
   */
  logError(message: string, type: ErrorInfo['type'] = 'unknown', details?: any): void {
    const error: ErrorInfo = {
      message,
      type,
      details,
      timestamp: new Date()
    };

    console.error(`[${type.toUpperCase()}] ${message}`, details);

    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Handle WebSocket errors specifically
   */
  handleWebSocketError(event: Event, context: string = 'WebSocket'): void {
    const target = event.target as WebSocket;
    let message = `${context} connection error`;
    
    if (target) {
      switch (target.readyState) {
        case WebSocket.CONNECTING:
          message = `${context}: Unable to connect to server`;
          break;
        case WebSocket.CLOSING:
          message = `${context}: Connection is closing`;
          break;
        case WebSocket.CLOSED:
          message = `${context}: Connection has been closed`;
          break;
        default:
          message = `${context}: Unknown connection error`;
      }
    }

    this.logError(message, 'websocket', {
      readyState: target?.readyState,
      url: target?.url,
      event: event.type
    });
  }

  /**
   * Handle network/API errors
   */
  handleNetworkError(error: any, context: string = 'Network'): void {
    let message = `${context} error`;
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      message = 'Unable to connect to server. Please check your internet connection.';
    } else if (error?.response?.status) {
      message = `${context} error: ${error.response.status} ${error.response.statusText}`;
    } else if (error?.message) {
      message = `${context}: ${error.message}`;
    }

    this.logError(message, 'network', error);
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: ErrorInfo): string {
    switch (error.type) {
      case 'websocket':
        return 'Problema de conexão em tempo real. Algumas notificações podem não aparecer imediatamente.';
      case 'network':
        return 'Problema de conexão com o servidor. Verifique sua internet.';
      case 'api':
        return 'Erro no servidor. Tente novamente em alguns instantes.';
      case 'validation':
        return error.message;
      default:
        return 'Ocorreu um erro inesperado. Tente recarregar a página.';
    }
  }

  /**
   * Add error listener
   */
  addListener(callback: (error: ErrorInfo) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorInfo[] {
    return this.errors.slice(0, limit);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Check if there are recent errors of a specific type
   */
  hasRecentErrors(type: ErrorInfo['type'], withinMinutes: number = 5): boolean {
    const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
    return this.errors.some(error => 
      error.type === type && error.timestamp > cutoff
    );
  }
}

export const errorHandler = new ErrorHandler();

// Global error handlers
window.addEventListener('error', (event) => {
  errorHandler.logError(
    event.message || 'JavaScript error',
    'unknown',
    {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
  );
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.logError(
    `Unhandled promise rejection: ${event.reason}`,
    'unknown',
    event.reason
  );
});

export default errorHandler;
