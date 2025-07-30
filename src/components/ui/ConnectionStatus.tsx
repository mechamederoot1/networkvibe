import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  onRetry,
  className = ''
}) => {
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => setShowOffline(true), 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    } else {
      setShowOffline(false);
    }
  }, [isConnected]);

  if (isConnected || !showOffline) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <WifiOff className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">
              Conexão perdida
            </h4>
            <p className="text-sm text-red-600 mt-1">
              Não foi possível conectar ao servidor. Algumas funcionalidades podem não funcionar.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center space-x-1 text-sm text-red-700 hover:text-red-800 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar novamente</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface OnlineStatusProps {
  className?: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-700 font-medium">
            Sem conexão com a internet
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
