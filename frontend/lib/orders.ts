import { apiFetch } from './api';
import type { Quote, QuoteRequest, ContactRequestBody, UploadResult } from './types';

export function createQuote(req: QuoteRequest): Promise<Quote> {
  return apiFetch<Quote>('/quotes', { method: 'POST', body: req });
}

export function createContact(req: ContactRequestBody): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/contact', { method: 'POST', body: req });
}

// Admin: sube un archivo (multipart, campo `file`) y devuelve el id de GridFS.
export function uploadImage(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  return apiFetch<UploadResult>('/uploads', { method: 'POST', body: fd });
}
