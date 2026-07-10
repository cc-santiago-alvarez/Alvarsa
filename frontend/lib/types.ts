// Espejo de los DTOs del backend Go (camelCase). Fuente de verdad: backend/internal/adapters/http/dto.go

export type Role = 'admin' | 'customer' | '';

export interface Me {
  authenticated: boolean;
  role: Role;
  userId: string;
}

export interface Customization {
  metal: string[];
  madera: string[];
  medida: string[];
}

export interface AdminFields {
  internalCost: number;
  workshopNotes: string;
  supplierRef: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number; // COP entero
  dims: string;
  materialsEs: string;
  materialsEn: string;
  descriptionEs: string;
  descriptionEn: string;
  imageIds: string[];
  customization: Customization;
  custom: boolean;
  admin?: AdminFields; // solo presente con sesión admin
}

export interface Category {
  id: string;
  nameEs: string;
  nameEn: string;
  imageId: string;
}

// Selección congelada de personalización (una opción por eje).
export interface OptionSelection {
  metal: string;
  madera: string;
  medida: string;
}

export interface QuoteItemRequest {
  productId: string;
  name: string;
  price: number;
  qty: number;
  options: Record<string, string>;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface QuoteRequest {
  items: QuoteItemRequest[];
  contact: ContactInfo;
}

export interface Quote extends QuoteRequest {
  id: string;
  subtotal: number;
  status: 'new' | 'contacted' | 'closed';
}

export interface ContactRequestBody {
  name: string;
  phone: string;
  reason: string;
  attachments: string[];
}

export interface UploadResult {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

// Cuerpo para POST/PUT /products (admin). No enviar id/custom/timestamps.
export interface ProductInput {
  name: string;
  categoryId: string;
  price: number;
  dims: string;
  materialsEs: string;
  materialsEn: string;
  descriptionEs: string;
  descriptionEn: string;
  imageIds: string[];
  customization: Customization;
  admin?: AdminFields;
}
