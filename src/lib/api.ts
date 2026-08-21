let apiToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('secret_pin') : null;

export function setApiToken(token: string | null) {
  apiToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('secret_pin', token);
    } else {
      localStorage.removeItem('secret_pin');
    }
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  const token = apiToken || (typeof window !== 'undefined' ? localStorage.getItem('secret_pin') : null) || '1234';
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          localStorage.removeItem('secret_pin');
          window.location.href = '/login';
        }
      }
      const errorText = await response.text().catch(() => '');
      let errorMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        // use raw text
      }
      throw new Error(errorMsg || `API error (${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error: any) {
    // If it is an abort or network connection drop, log helpful context
    console.warn(`[API] Failed request to ${url}:`, error?.message || error);
    throw error;
  }
}
