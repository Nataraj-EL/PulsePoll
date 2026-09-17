import React, { useState, useEffect, useRef } from 'react';
import { getPollResults, getPollWebSocketUrl } from '../services/api';

export function LiveResultsView({ pollCode, question, options = [] }) {
  const [resultsData, setResultsData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected'
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  // Fallback initial load via HTTP REST
  useEffect(() => {
    let isMounted = true;
    async function loadInitialResults() {
      try {
        const res = await getPollResults(pollCode);
        if (isMounted && res.ok && res.data) {
          setResultsData(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load initial poll results:', err);
      }
    }
    loadInitialResults();
    return () => { isMounted = false; };
  }, [pollCode]);

  // Realtime WebSocket Connection & Listener
  useEffect(() => {
    let isMounted = true;
    let reconnectTimer = null;

    function connectWebSocket() {
      if (!pollCode) return;

      setConnectionStatus('connecting');
      const wsUrl = getPollWebSocketUrl(pollCode);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) {
          setConnectionStatus('connected');
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'init' || payload.type === 'vote_updated') {
            setResultsData({
              poll_id: payload.poll_id,
              code: payload.code,
              question: payload.question || question,
              total_votes: payload.total_votes,
              results: payload.results || [],
            });
            setLoading(false);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        if (isMounted) setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        if (isMounted) {
          setConnectionStatus('disconnected');
          // Attempt silent reconnect after 3 seconds
          reconnectTimer = setTimeout(() => {
            if (isMounted) connectWebSocket();
          }, 3000);
        }
      };
    }

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [pollCode]);

  const totalVotes = resultsData?.total_votes || 0;
  
  // Map results list to options structure for reliable fallback
  const countMap = {};
  if (resultsData?.results) {
    resultsData.results.forEach((item) => {
      countMap[item.option_id] = item.count;
    });
  }

  // Find max votes for highlighting winner/leader
  let maxCount = 0;
  options.forEach((opt) => {
    const c = countMap[opt.id] || 0;
    if (c > maxCount) maxCount = c;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Realtime Status Indicator Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: '12px 18px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--guvi-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
          {connectionStatus === 'connected' && (
            <>
              <span className="pulse-indicator" style={{ width: '10px', height: '10px' }}></span>
              <span style={{ color: '#15803d' }}>Live & Syncing (Realtime)</span>
            </>
          )}
          {connectionStatus === 'connecting' && (
            <>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
              <span style={{ color: '#b45309' }}>Connecting to Realtime stream...</span>
            </>
          )}
          {connectionStatus === 'disconnected' && (
            <>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
              <span style={{ color: '#b91c1c' }}>Reconnecting...</span>
            </>
          )}
        </div>

        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--guvi-navy)' }}>
          Total Votes: <span style={{ color: 'var(--guvi-green)', fontSize: '1.05rem' }}>{totalVotes}</span>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading live counts...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {options.map((opt) => {
            const count = countMap[opt.id] || 0;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isLeader = count > 0 && count === maxCount;

            return (
              <div key={opt.id} style={{
                border: isLeader ? '2px solid var(--guvi-green)' : '1px solid var(--guvi-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                backgroundColor: isLeader ? 'var(--guvi-green-light)' : '#ffffff',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--guvi-dark)' }}>
                      {opt.text}
                    </span>
                    {isLeader && totalVotes > 0 && (
                      <span className="guvi-badge guvi-badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        Leader
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--guvi-dark)' }}>
                    <span>{count} {count === 1 ? 'vote' : 'votes'}</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px', fontWeight: 600 }}>
                      ({percentage}%)
                    </span>
                  </div>
                </div>

                {/* Animated Visual Progress Bar */}
                <div style={{
                  height: '10px',
                  width: '100%',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  marginTop: '10px',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: isLeader ? 'var(--guvi-green)' : 'var(--guvi-navy)',
                    borderRadius: '5px',
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
