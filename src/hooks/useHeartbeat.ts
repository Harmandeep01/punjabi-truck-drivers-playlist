import { useState, useEffect } from 'react';

export interface ListenerStats {
  actualCount: number;
  simulatedOffset: number;
  displayCount: number;
  serverUptimeSec: number;
}

export function useHeartbeat() {
  const [stats, setStats] = useState<ListenerStats>({
    actualCount: 1,
    simulatedOffset: 45,
    displayCount: 46,
    serverUptimeSec: 0,
  });
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Retrieve or create persistent unique clientId
  const getClientId = () => {
    let id = localStorage.getItem('radio_client_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('radio_client_id', id);
    }
    return id;
  };

  const sendHeartbeat = async () => {
    try {
      const clientId = getClientId();
      const res = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats({
          actualCount: data.actualCount,
          simulatedOffset: data.simulatedOffset,
          displayCount: data.displayCount,
          serverUptimeSec: data.serverUptimeSec,
        });
        setIsConnected(true);
      }
    } catch (err) {
      console.warn('Heartbeat error:', err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial heartbeat
    sendHeartbeat();

    // Heartbeat interval every 10 seconds
    const interval = setInterval(sendHeartbeat, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isConnected,
  };
}
