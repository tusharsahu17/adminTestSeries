import apiClient from '../apiClient';
import type {
  CreatePdfCategoryPayload,
  PdfCategory,
  PdfDocument,
  PdfFilterParams,
  UpdatePdfCategoryPayload,
  UpdatePdfPayload,
  UploadPdfPayload,
} from '../../types/admin/pdf';

const DEFAULT_BACKEND = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001').replace(
  /\/+$/,
  ''
);

// Candidate backend base URLs to check
const CANDIDATE_URLS = Array.from(
  new Set([DEFAULT_BACKEND, 'http://localhost:5001', 'http://127.0.0.1:5001', 'http://localhost:3000', ''])
);

let resolvedBaseUrl: string | null = null;

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Resolves the working backend base URL by attempting candidates if primary returns 404 or connection error
 */
async function resolveWorkingBaseUrl(testPath: string): Promise<string> {
  if (resolvedBaseUrl !== null) return resolvedBaseUrl;

  for (const candidate of CANDIDATE_URLS) {
    try {
      const cleanCandidate = candidate.replace(/\/+$/, '');
      const testUrl = `${cleanCandidate}${testPath}`;
      const res = await fetch(testUrl, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      // If status is 200-299, 400, or 401/403 (meaning server answered and endpoint exists)
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403) {
        resolvedBaseUrl = cleanCandidate;
        return cleanCandidate;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Default to configured backend
  return DEFAULT_BACKEND;
}

export const pdfService = {
  /**
   * Get active resolved base URL
   */
  getActiveBaseUrl: (): string => {
    return resolvedBaseUrl ?? DEFAULT_BACKEND;
  },

  /**
   * Upload a new PDF with category name using multipart/form-data
   * Endpoint: POST /api/pdfs (or /api/admin/pdfs)
   */
  uploadPdf: async (payload: UploadPdfPayload): Promise<PdfDocument> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('categoryName', payload.categoryName.trim());
    formData.append('title', payload.title.trim());
    if (payload.description) {
      formData.append('description', payload.description.trim());
    }

    const baseUrl = await resolveWorkingBaseUrl('/api/pdfs');
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdfs`,
      `${baseUrl}/api/admin/pdfs`,
      '/api/pdfs', // relative proxy via next.config.ts rewrite
    ];

    let lastError: any = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
        });

        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const data = isJson ? await res.json() : await res.text();

        if (res.ok) {
          return data.data || data.pdf || data;
        }

        if (res.status === 404) {
          continue; // Try next alias or proxy
        }

        throw new Error(
          (isJson && (data.error || data.message)) || `Upload failed with status ${res.status}`
        );
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('Failed to upload PDF. Please check backend connection.');
  },

  /**
   * Get all PDFs with optional filters
   * Endpoint: GET /api/pdfs (filters: ?categoryName=..., ?categoryId=..., ?search=..., ?page=...&limit=...)
   */
  getPdfs: async (
    params?: PdfFilterParams
  ): Promise<{ pdfs: PdfDocument[]; total: number; page?: number; limit?: number }> => {
    const baseUrl = await resolveWorkingBaseUrl('/api/pdfs');
    const headers = getAuthHeaders();

    const query = new URLSearchParams();
    if (params?.categoryName) query.set('categoryName', params.categoryName);
    if (params?.categoryId) query.set('categoryId', String(params.categoryId));
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const endpoints = [
      `${baseUrl}/api/pdfs${qs}`,
      `${baseUrl}/api/admin/pdfs${qs}`,
      `/api/pdfs${qs}`, // relative proxy via Next.js rewrite
    ];

    let lastError: any = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'GET', headers });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          return normalizePdfListResponse(json);
        }
        if (res.status === 404) continue;
      } catch (err: any) {
        lastError = err;
      }
    }

    // Try other candidate URLs if primary failed
    for (const candidate of CANDIDATE_URLS) {
      if (candidate === baseUrl) continue;
      try {
        const cleanCandidate = candidate.replace(/\/+$/, '');
        const url = `${cleanCandidate}/api/pdfs${qs}`;
        const res = await fetch(url, { method: 'GET', headers });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          resolvedBaseUrl = cleanCandidate;
          const json = await res.json();
          return normalizePdfListResponse(json);
        }
      } catch {
        // Continue
      }
    }

    if (lastError) throw lastError;
    throw new Error(
      `Cannot GET /api/pdfs from backend (${baseUrl}). Please check if your backend server is running.`
    );
  },

  /**
   * Get details for a single PDF
   * Endpoint: GET /api/pdfs/:id
   */
  getPdfById: async (id: string | number): Promise<PdfDocument> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdfs/${id}`);
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdfs/${id}`,
      `${baseUrl}/api/admin/pdfs/${id}`,
      `/api/pdfs/${id}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'GET', headers });
        if (res.ok) {
          const json = await res.json();
          return json.data || json.pdf || json;
        }
      } catch {
        // Next
      }
    }
    throw new Error(`PDF #${id} not found`);
  },

  /**
   * Update metadata and/or replace PDF file
   * Endpoint: PUT /api/pdfs/:id
   */
  updatePdf: async (id: string | number, payload: UpdatePdfPayload): Promise<PdfDocument> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdfs/${id}`);
    const headers = getAuthHeaders();

    if (payload.file) {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.title !== undefined) formData.append('title', payload.title.trim());
      if (payload.description !== undefined) formData.append('description', payload.description.trim());
      if (payload.categoryName !== undefined) formData.append('categoryName', payload.categoryName.trim());

      const endpoints = [
        `${baseUrl}/api/pdfs/${id}`,
        `${baseUrl}/api/admin/pdfs/${id}`,
        `/api/pdfs/${id}`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'PUT',
            headers,
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            return data.data || data.pdf || data;
          }
        } catch {
          // Next
        }
      }
      throw new Error('Failed to update PDF');
    } else {
      const updateData: Record<string, string> = {};
      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.description !== undefined) updateData.description = payload.description.trim();
      if (payload.categoryName !== undefined) updateData.categoryName = payload.categoryName.trim();

      const endpoints = [
        `${baseUrl}/api/pdfs/${id}`,
        `${baseUrl}/api/admin/pdfs/${id}`,
        `/api/pdfs/${id}`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(updateData),
          });
          if (res.ok) {
            const data = await res.json();
            return data.data || data.pdf || data;
          }
        } catch {
          // Next
        }
      }
      throw new Error('Failed to update PDF metadata');
    }
  },

  /**
   * Delete PDF from database and disk
   * Endpoint: DELETE /api/pdfs/:id
   */
  deletePdf: async (id: string | number): Promise<any> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdfs/${id}`);
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdfs/${id}`,
      `${baseUrl}/api/admin/pdfs/${id}`,
      `/api/pdfs/${id}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'DELETE', headers });
        if (res.ok) return await res.json();
      } catch {
        // Next
      }
    }
    throw new Error('Failed to delete PDF');
  },

  /**
   * Get all categories with nested list of PDFs and pdfCount
   * Endpoint: GET /api/pdf-categories
   */
  getPdfCategories: async (): Promise<PdfCategory[]> => {
    const baseUrl = await resolveWorkingBaseUrl('/api/pdf-categories');
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdf-categories`,
      `${baseUrl}/api/admin/pdf-categories`,
      '/api/pdf-categories', // relative proxy via Next.js rewrite
    ];

    let lastError: any = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'GET', headers });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          return normalizeCategoryList(json);
        }
        if (res.status === 404) continue;
      } catch (err: any) {
        lastError = err;
      }
    }

    // Try other candidate URLs if primary failed
    for (const candidate of CANDIDATE_URLS) {
      if (candidate === baseUrl) continue;
      try {
        const cleanCandidate = candidate.replace(/\/+$/, '');
        const url = `${cleanCandidate}/api/pdf-categories`;
        const res = await fetch(url, { method: 'GET', headers });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          resolvedBaseUrl = cleanCandidate;
          const json = await res.json();
          return normalizeCategoryList(json);
        }
      } catch {
        // Continue
      }
    }

    if (lastError) throw lastError;
    throw new Error(
      `Cannot GET /api/pdf-categories from backend (${baseUrl}). Please check if your backend server is running.`
    );
  },

  /**
   * Get single category with all its PDFs
   * Endpoint: GET /api/pdf-categories/:id
   */
  getPdfCategoryById: async (id: string | number): Promise<PdfCategory> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdf-categories/${id}`);
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdf-categories/${id}`,
      `${baseUrl}/api/admin/pdf-categories/${id}`,
      `/api/pdf-categories/${id}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'GET', headers });
        if (res.ok) {
          const json = await res.json();
          return json.data || json.category || json;
        }
      } catch {
        // Next
      }
    }
    throw new Error(`Category #${id} not found`);
  },

  /**
   * Get all PDFs belonging to this category
   * Endpoint: GET /api/pdf-categories/:id/pdfs
   */
  getPdfCategoryPdfs: async (id: string | number): Promise<PdfDocument[]> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdf-categories/${id}/pdfs`);
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdf-categories/${id}/pdfs`,
      `${baseUrl}/api/admin/pdf-categories/${id}/pdfs`,
      `/api/pdf-categories/${id}/pdfs`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'GET', headers });
        if (res.ok) {
          const json = await res.json();
          return Array.isArray(json) ? json : json.data || json.pdfs || [];
        }
      } catch {
        // Next
      }
    }
    return [];
  },

  /**
   * Create category directly
   * Endpoint: POST /api/pdf-categories
   */
  createPdfCategory: async (data: CreatePdfCategoryPayload): Promise<PdfCategory> => {
    const baseUrl = await resolveWorkingBaseUrl('/api/pdf-categories');
    const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };

    const endpoints = [
      `${baseUrl}/api/pdf-categories`,
      `${baseUrl}/api/admin/pdf-categories`,
      '/api/pdf-categories',
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const resData = await res.json();
          return resData.data || resData.category || resData;
        }
      } catch {
        // Next
      }
    }
    throw new Error('Failed to create category');
  },

  /**
   * Update category name or description
   * Endpoint: PUT /api/pdf-categories/:id
   */
  updatePdfCategory: async (
    id: string | number,
    data: UpdatePdfCategoryPayload
  ): Promise<PdfCategory> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdf-categories/${id}`);
    const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };

    const endpoints = [
      `${baseUrl}/api/pdf-categories/${id}`,
      `${baseUrl}/api/admin/pdf-categories/${id}`,
      `/api/pdf-categories/${id}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const resData = await res.json();
          return resData.data || resData.category || resData;
        }
      } catch {
        // Next
      }
    }
    throw new Error('Failed to update category');
  },

  /**
   * Delete category and all its associated PDF files
   * Endpoint: DELETE /api/pdf-categories/:id
   */
  deletePdfCategory: async (id: string | number): Promise<any> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdf-categories/${id}`);
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}/api/pdf-categories/${id}`,
      `${baseUrl}/api/admin/pdf-categories/${id}`,
      `/api/pdf-categories/${id}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'DELETE', headers });
        if (res.ok) return await res.json();
      } catch {
        // Next
      }
    }
    throw new Error('Failed to delete category');
  },

  /**
   * Get direct view URL
   */
  getPdfViewUrl: (id: string | number): string => {
    const base = pdfService.getActiveBaseUrl();
    return `${base}/api/pdfs/${id}/view`;
  },

  /**
   * Get direct download URL
   */
  getPdfDownloadUrl: (id: string | number): string => {
    const base = pdfService.getActiveBaseUrl();
    return `${base}/api/pdfs/${id}/download`;
  },

  /**
   * Fetch authenticated PDF blob for view or download
   */
  fetchPdfBlob: async (id: string | number, action: 'view' | 'download' = 'view'): Promise<Blob> => {
    const baseUrl = await resolveWorkingBaseUrl(`/api/pdfs/${id}`);
    const endpoint = action === 'download' ? `/api/pdfs/${id}/download` : `/api/pdfs/${id}/view`;
    const headers = getAuthHeaders();

    const endpoints = [
      `${baseUrl}${endpoint}`,
      `${baseUrl}/api/admin/pdfs/${id}/${action}`,
      endpoint,
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          return await response.blob();
        }
      } catch {
        // Next
      }
    }

    throw new Error(`Failed to ${action} PDF file`);
  },

  /**
   * Trigger download of PDF file to user device
   */
  downloadPdfFile: async (id: string | number, filename?: string): Promise<void> => {
    try {
      const blob = await pdfService.fetchPdfBlob(id, 'download');
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename
        ? filename.endsWith('.pdf')
          ? filename
          : `${filename}.pdf`
        : `document-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      const directUrl = pdfService.getPdfDownloadUrl(id);
      const link = document.createElement('a');
      link.href = directUrl;
      link.download = filename || `document-${id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
};

function normalizePdfListResponse(res: any): {
  pdfs: PdfDocument[];
  total: number;
  page?: number;
  limit?: number;
} {
  if (Array.isArray(res)) {
    return { pdfs: res, total: res.length };
  }
  if (Array.isArray(res?.pdfs)) {
    return {
      pdfs: res.pdfs,
      total: res.total !== undefined ? Number(res.total) : res.pdfs.length,
      page: res.page,
      limit: res.limit,
    };
  }
  if (Array.isArray(res?.data?.pdfs)) {
    return {
      pdfs: res.data.pdfs,
      total: res.data.total !== undefined ? Number(res.data.total) : res.data.pdfs.length,
      page: res.data.page,
      limit: res.data.limit,
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      pdfs: res.data,
      total: res.total !== undefined ? Number(res.total) : res.data.length,
      page: res.page,
      limit: res.limit,
    };
  }
  return { pdfs: [], total: 0 };
}

function normalizeCategoryList(res: any): PdfCategory[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.data?.categories)) return res.data.categories;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}
