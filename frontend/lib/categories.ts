import { apiFetch } from './api';
import type { Category } from './types';

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}
