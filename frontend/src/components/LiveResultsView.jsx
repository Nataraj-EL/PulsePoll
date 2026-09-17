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
          if (payload && (payload.results || payload.total_votes !== undefined)) {
            setResultsData(payload);
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
      countMap[item.option_id] = item.votes !== undefined ? item.votes : (item.count !== undefined ? item.count : 0);
    });
  }

  // Find max votes for highlighting winner/leader
  let maxCount = 0;
  options.forEach((opt) => {
    const c = countMap[opt.id] || 0;
    if (c > maxCount) maxCount = c;
  });

  return (
    <div>
      {/* Results Section */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="pulse-indicator" style={{ margin: '0 auto 12px auto', width: '14px', height: '14px' }}></div>
          Loading results...
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--guvi-border)',
          padding: 'clamp(20px, 4vw, 28px) clamp(12px, 3vw, 20px) clamp(16px, 3vw, 24px) clamp(12px, 3vw, 20px)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header Row: Clean Total Votes Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--guvi-border)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}>
              <span>Total Votes</span>
              <span style={{
                color: 'var(--guvi-navy)',
                fontSize: '0.95rem',
                fontWeight: 800,
                backgroundColor: '#ffffff',
                padding: '2px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}>
                {totalVotes}
              </span>
            </div>
          </div>
          {/* Vertical Bar Chart Container */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: 'clamp(180px, 25vh, 220px)',
            gap: '8px',
            paddingBottom: '0px',
            borderBottom: '2px solid var(--guvi-border)',
            overflowX: 'auto',
          }}>
            {options.map((opt) => {
              const count = countMap[opt.id] || 0;
              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isLeader = count > 0 && count === maxCount;
              const barHeightPct = totalVotes > 0 ? percentage : 0;

              return (
                <div
                  key={opt.id}
                  style={{
                    flex: 1,
                    maxWidth: '110px',
                    minWidth: 'min(100%, 50px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Vote Count & Percentage Badge */}
                  <div style={{
                    fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                    fontWeight: 800,
                    color: isLeader ? '#15803d' : 'var(--guvi-dark)',
                    marginBottom: '8px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    opacity: totalVotes > 0 ? 1 : 0.6,
                  }}>
                    <div>{count} {count === 1 ? 'vote' : 'votes'}</div>
                    <div style={{ fontSize: 'clamp(0.68rem, 1.6vw, 0.75rem)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {percentage}%
                    </div>
                  </div>

                  {/* Direct Dynamic Bar Element */}
                  <div style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: `${barHeightPct}%`,
                    maxHeight: '140px',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, box-shadow 0.3s ease',
                    backgroundColor: isLeader ? 'var(--guvi-green)' : 'var(--guvi-navy)',
                    backgroundImage: isLeader
                      ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
                    boxShadow: isLeader
                      ? '0 4px 14px rgba(16, 185, 129, 0.35)'
                      : 'none',
                  }} />
                </div>
              );
            })}
          </div>

          {/* Labels Row below axis */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: '8px',
            marginTop: '12px',
            overflowX: 'auto',
          }}>
            {options.map((opt) => {
              const count = countMap[opt.id] || 0;
              const isLeader = count > 0 && count === maxCount;

              return (
                <div
                  key={opt.id}
                  style={{
                    flex: 1,
                    maxWidth: '110px',
                    minWidth: 'min(100%, 50px)',
                    textAlign: 'center',
                    padding: '0 2px',
                  }}
                >
                  <div style={{
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                    fontWeight: 700,
                    color: isLeader ? 'var(--guvi-dark)' : 'var(--color-text-main)',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}>
                    {opt.text}
                  </div>
                  {isLeader && totalVotes > 0 && (
                    <span className="guvi-badge guvi-badge-green" style={{ fontSize: '0.65rem', padding: '1px 6px', marginTop: '4px', display: 'inline-block' }}>
                      Leader
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
