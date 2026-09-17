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

  const totalVoters = resultsData?.total_votes || 0;
  
  // Map results list to options structure for reliable fallback
  const countMap = {};
  if (resultsData?.results) {
    resultsData.results.forEach((item) => {
      countMap[item.option_id] = item.votes !== undefined ? item.votes : (item.count !== undefined ? item.count : 0);
    });
  }

  // Calculate sum of all option selections
  let totalSelections = 0;
  options.forEach((opt) => {
    totalSelections += (countMap[opt.id] || 0);
  });

  // Find max votes for highlighting winner/leader
  let maxCount = 0;
  options.forEach((opt) => {
    const c = countMap[opt.id] || 0;
    if (c > maxCount) maxCount = c;
  });

  // Use totalSelections as denominator for multiple choice polls so percentage calculation sums to 100%
  const isMultipleChoice = resultsData?.choice_type === 'multiple';
  const denom = isMultipleChoice
    ? (totalSelections > 0 ? totalSelections : totalVoters)
    : (totalVoters > 0 ? totalVoters : totalSelections);

  return (
    <div>
      {/* Results Section */}
      {loading ? (
        <div style={{
          padding: '48px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--color-text-muted)',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}>
          <span className="pulse-indicator" style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          <span>Loading results...</span>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--guvi-border)',
          padding: 'clamp(20px, 4vw, 28px) clamp(12px, 3vw, 20px) clamp(16px, 3vw, 24px) clamp(12px, 3vw, 20px)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header Row: Total Voters & Total Selections */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
          }}>
            {isMultipleChoice && totalSelections !== totalVoters ? (
              <span>
                Total Respondents: <strong style={{ color: 'var(--guvi-dark)', fontWeight: 800 }}>{totalVoters}</strong>
                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>•</span>
                Total Selections: <strong style={{ color: 'var(--guvi-dark)', fontWeight: 800 }}>{totalSelections}</strong>
              </span>
            ) : (
              <span>Total Votes: <strong style={{ color: 'var(--guvi-dark)', fontWeight: 800 }}>{totalVoters}</strong></span>
            )}
          </div>
          {/* Vertical Bar Chart Container */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: 'clamp(210px, 30vh, 250px)',
            gap: '12px',
            paddingTop: '48px',
            paddingBottom: '0px',
            borderBottom: '2px solid var(--guvi-border)',
            overflowX: 'auto',
          }}>
            {options.map((opt) => {
              const count = countMap[opt.id] || 0;
              const percentage = denom > 0 ? Math.round((count / denom) * 100) : 0;
              const isLeader = count > 0 && count === maxCount;
              const barHeightPct = denom > 0 ? percentage : 0;

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
                  {/* Dynamic Height Bar Wrapper */}
                  <div style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${barHeightPct}%`,
                    minHeight: '4px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    transition: 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}>
                    {/* Vote Count & Percentage Badge anchored above bar tip */}
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: '6px',
                      fontSize: 'clamp(0.72rem, 1.8vw, 0.825rem)',
                      fontWeight: 800,
                      color: isLeader ? '#047857' : 'var(--guvi-dark)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                      opacity: denom > 0 ? 1 : 0.65,
                      pointerEvents: 'none',
                    }}>
                      <div>{count} {count === 1 ? 'vote' : 'votes'}</div>
                      <div style={{ fontSize: 'clamp(0.68rem, 1.6vw, 0.75rem)', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '1px' }}>
                        {percentage}%
                      </div>
                    </div>

                    {/* Refined Dynamic Tonal Bar Element */}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '6px 6px 0 0',
                      backgroundImage: isLeader
                        ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                        : 'linear-gradient(180deg, #475569 0%, #1e293b 100%)',
                      borderTop: barHeightPct > 0
                        ? (isLeader ? '2.5px solid rgba(255, 255, 255, 0.5)' : '2px solid rgba(255, 255, 255, 0.25)')
                        : 'none',
                      boxShadow: barHeightPct > 0
                        ? (isLeader ? '0 4px 14px -2px rgba(16, 185, 129, 0.35)' : '0 2px 8px -2px rgba(15, 23, 42, 0.15)')
                        : 'none',
                      boxSizing: 'border-box',
                    }} />
                  </div>
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
                    fontWeight: isLeader ? 800 : 600,
                    color: isLeader ? 'var(--guvi-dark)' : 'var(--color-text-main)',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}>
                    {opt.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
