import { useState, useEffect } from 'react';
import { errorHandler, ErrorInfo } from '../utils/errorHandler';

export const useConnectionStatus = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasWebSocketErrors, setHasWebSocketErrors] = useState(false);

  useEffect(() => {
    // Listen for network status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for errors
    const removeErrorListener = errorHandler.addListener((error) => {
      setErrors(prev => [error, ...prev.slice(0, 4)]); // Keep last 5 errors
      
      if (error.type === 'websocket') {
        setHasWebSocketErrors(true);
        // Auto-clear websocket error flag after 30 seconds
        setTimeout(() => setHasWebSocketErrors(false), 30000);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeErrorListener();
    };
  }, []);

  const clearErrors = () => {
    setErrors([]);
    errorHandler.clearErrors();
  };

  const retryConnection = () => {
    // This would be implemented by components using this hook
    window.location.reload();
  };

  return {
    errors,
    isOnline,
    hasWebSocketErrors,
    hasRecentErrors: errors.length > 0,
    clearErrors,
    retryConnection
  };
};
