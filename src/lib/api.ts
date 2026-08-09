let apiToken: string | null = localStorage.getItem('secret_pin');

export function setApiToken(token: string | null) {
  apiToken = token;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (apiToken) {
    headers.set('Authorization', `Bearer ${apiToken}`);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
       localStorage.removeItem('secret_pin');
       window.location.href = '/login';
    }
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
