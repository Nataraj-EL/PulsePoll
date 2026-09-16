/**
 * PulsePoll API Client Service
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Universal helper for API HTTP requests with credentials (cookies)
 */
async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // CRITICAL: Send and receive HTTP-Only session cookies across origins
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message || 'Network error connecting to server',
      data: {
        error: 'Network Error',
        message: 'Unable to reach backend server. Please check your internet connection.',
      },
    };
  }
}

/**
 * Register a new creator account
 */
export async function signupUser({ name, email, password }) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Authenticate returning user
 */
export async function loginUser({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Logout authenticated session
 */
export async function logoutUser() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Fetch current authenticated user profile
 */
export async function getCurrentUser() {
  return apiFetch('/auth/me', {
    method: 'GET',
  });
}

/**
 * Infrastructure health check
 */
export async function fetchHealthStatus() {
  return apiFetch('/health', {
    method: 'GET',
  });
}
