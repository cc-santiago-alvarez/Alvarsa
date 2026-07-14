// Cliente HTTP central. Todos los fetch pasan por aquí: base URL + credentials:'include'
// (cookie de sesión alv_session) + manejo del error plano { "error": "CODIGO" } del backend.

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

interface FetchOpts {
  method?: string;
  body?: unknown; // objeto → JSON, o FormData (multipart) sin tocar Content-Type
  query?: Record<string, string | undefined>;
}

function buildUrl(path: string, query?: FetchOpts['query']): string {
  const url = new URL(BASE + '/api' + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { method = 'GET', body, query } = opts;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (isForm) {
      payload = body as FormData; // el navegador fija el boundary
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
    credentials: 'include',
    cache: 'no-store',
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let code = 'REQUEST_FAILED';
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string') code = data.error;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(code, res.status);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// URL absoluta de una imagen de GridFS servida por el backend.
export function imageUrl(id: string): string {
  return `${BASE}/api/images/${id}`;
}

// URL absoluta de un modelo 3D (.glb/.usdz) servido por el backend. Debe ser
// alcanzable desde el dispositivo (no localhost) para que Scene Viewer/Quick Look
// puedan descargarlo en AR.
export function modelUrl(id: string): string {
  return `${BASE}/api/models/${id}`;
}
