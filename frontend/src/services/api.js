/**
 * PulsePoll API Client Service
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Fetch health status of backend service and connected databases (MongoDB, Redis)
 * @returns {Promise<Object>}
 */
export async function fetchHealthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message || 'Failed to connect to backend server',
      data: {
        status: 'disconnected',
        environment: 'unknown',
        services: {
          mongodb: { status: 'disconnected', latency_ms: 0, error: 'Backend unreachable' },
          redis: { status: 'disconnected', latency_ms: 0, error: 'Backend unreachable' },
        },
      },
    };
  }
}
