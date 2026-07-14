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

// Modelo 3D para realidad aumentada. Solo presente en el producto si tiene .glb.
// Espejo de model3DDTO del backend. La escala física la lleva el propio .glb;
// las dimensiones en cm son informativas.
export interface Model3D {
  glbId: string; // id GridFS del .glb (Android/web)
  usdzId: string; // id GridFS del .usdz (AR iOS); "" si no hay
  posterId: string; // id de imagen como póster; "" si no hay
  widthCm: number;
  heightCm: number;
  depthCm: number;
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
  model3d?: Model3D; // solo presente si el producto tiene .glb
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
  model3d?: Model3D;
  admin?: AdminFields;
}
