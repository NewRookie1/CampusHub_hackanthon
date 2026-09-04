const BASE = '';

async function request(method: string, url: string, data?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json;
}

async function uploadFile(url: string, file: File, token?: string) {
  const formData = new FormData();
  formData.append('resume', file);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Upload failed');
  return json;
}

export const api = {
  get: async (url: string, token?: string) => {
    const res = await fetch(`${BASE}${url}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error?.message || 'Request failed');
    return json;
  },

  post: (url: string, data: unknown, token?: string) => request('POST', url, data, token),
  put: (url: string, data: unknown, token?: string) => request('PUT', url, data, token),
  delete: (url: string, token?: string) => request('DELETE', url, undefined, token),
  upload: uploadFile,
};
