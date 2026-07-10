import { apiFetch } from './api';
import type { Me } from './types';

export function me(): Promise<Me> {
  return apiFetch<Me>('/auth/me');
}

export function login(email: string, password: string): Promise<Me> {
  return apiFetch<Me>('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(email: string, password: string): Promise<Me> {
  return apiFetch<Me>('/auth/register', { method: 'POST', body: { email, password } });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

// Solo admin: crea un usuario con rol.
export function createUser(email: string, password: string, role: 'admin' | 'customer') {
  return apiFetch<{ id: string; email: string; role: string }>('/users', {
    method: 'POST',
    body: { email, password, role },
  });
}
