'use client';

import { useState, useEffect } from 'react';

interface NetworkState {
  online: boolean;
  downlink?: number;
  effectiveType?: string;
}

interface Connection {
  downlink: number;
  effectiveType: string;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: Connection;
  }
}

export default function NetworkStatus() {
  const [network, setNetwork] = useState<NetworkState>({
    online: true
  });

  useEffect(() => {
    // Update online status
    const updateOnlineStatus = () => {
      setNetwork(prev => ({
        ...prev,
        online: navigator.onLine
      }));
    };

    // Update connection info if available
    const updateConnectionStatus = () => {
      const connection = navigator.connection;
      if (connection) {
        setNetwork({
          online: navigator.onLine,
          downlink: connection.downlink,
          effectiveType: connection.effectiveType
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionStatus);
      // Initial check
      updateConnectionStatus();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return (
    <div className="text-sm mt-6">
      {network.online ? (
        <div className="flex items-center gap-2">
          <span className="text-green-400">●</span>
          {network.effectiveType && network.downlink ? (
            <span>{network.effectiveType.toUpperCase()} ({network.downlink} Mbps)</span>
          ) : (
            <span>Online</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-red-400">●</span>
          <span>Offline</span>
        </div>
      )}
    </div>
  );
} 