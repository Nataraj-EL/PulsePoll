import React, { useState, useEffect } from 'react';
import { fetchHealthStatus } from '../services/api';

export function HealthWidget() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    const response = await fetchHealthStatus();
    setHealthData(response.data);
    setLoading(false);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'connected' || status === 'ok') {
      return <span className="badge badge-success">Online / Connected</span>;
    }
    if (status === 'degraded') {
      return <span className="badge badge-warning">Degraded</span>;
    }
    return <span className="badge badge-danger">Disconnected / Down</span>;
  };

  return (
    <div id="health-status" className="card" style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ Infrastructure Health Verification
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Sprint 1 End-to-End Connectivity Check (Go/Gin Backend ↔ MongoDB ↔ Redis)
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          {loading ? 'Refreshing...' : '🔄 Re-verify Health'}
        </button>
      </div>

      {healthData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Go / Gin Backend Status */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Go / Gin Server</span>
              {getStatusBadge(healthData.status)}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <div><strong>Env:</strong> {healthData.environment || 'development'}</div>
              <div><strong>Port:</strong> 8080 (HTTP)</div>
            </div>
          </div>

          {/* MongoDB Status */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>MongoDB Service</span>
              {getStatusBadge(healthData.services?.mongodb?.status)}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <div><strong>Role:</strong> Persistent Data Store</div>
              <div><strong>Ping Latency:</strong> {healthData.services?.mongodb?.latency_ms ?? 0} ms</div>
              {healthData.services?.mongodb?.error && (
                <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>
                  {healthData.services.mongodb.error}
                </div>
              )}
            </div>
          </div>

          {/* Redis Status */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Redis Service</span>
              {getStatusBadge(healthData.services?.redis?.status)}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <div><strong>Role:</strong> Realtime Counters & Pub/Sub</div>
              <div><strong>Ping Latency:</strong> {healthData.services?.redis?.latency_ms ?? 0} ms</div>
              {healthData.services?.redis?.error && (
                <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>
                  {healthData.services.redis.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {lastUpdated && (
        <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
          Last checked: {lastUpdated} • Auto-refreshing every 10s
        </div>
      )}
    </div>
  );
}
