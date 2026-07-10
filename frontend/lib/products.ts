import { apiFetch } from './api';
import type { Product, ProductInput } from './types';

export function getProducts(params: { categoryId?: string; q?: string } = {}): Promise<Product[]> {
  return apiFetch<Product[]>('/products', { query: { categoryId: params.categoryId, q: params.q } });
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<Product>('/products', { method: 'POST', body: input });
}

export function updateProduct(id: string, input: ProductInput): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: 'PUT', body: input });
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: 'DELETE' });
}
