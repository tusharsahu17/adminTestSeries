export interface PdfDocument {
  id: string | number;
  title: string;
  description?: string;
  categoryName?: string;
  categoryId?: string | number;
  category_id?: string | number;
  category?: {
    id: string | number;
    name: string;
    description?: string;
  };
  filename?: string;
  originalName?: string;
  fileSize?: number | string;
  file_size?: number | string;
  size?: number | string;
  filePath?: string;
  file_path?: string;
  url?: string;
  viewUrl?: string;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PdfCategory {
  id: string | number;
  name: string;
  description?: string;
  pdfCount?: number;
  pdf_count?: number;
  pdfs?: PdfDocument[];
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PdfFilterParams {
  categoryName?: string;
  categoryId?: string | number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UploadPdfPayload {
  file: File;
  categoryName: string;
  title: string;
  description?: string;
}

export interface UpdatePdfPayload {
  title?: string;
  description?: string;
  categoryName?: string;
  file?: File;
}

export interface CreatePdfCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdatePdfCategoryPayload {
  name?: string;
  description?: string;
}
