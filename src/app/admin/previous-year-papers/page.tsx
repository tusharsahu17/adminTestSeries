'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Layers,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import AdminModal from '../../../components/admin/AdminModal';
import { adminService } from '../../../services/adminService';
import type { PdfCategory, PdfDocument } from '../../../types/admin/pdf';
import { formatBytes, formatDateTime, getErrorMessage } from '../../../utils/formatters';

type ActiveTab = 'all' | 'by-category' | 'categories';

export default function PreviousYearPapersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [categories, setCategories] = useState<PdfCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backendError, setBackendError] = useState<{ message: string; attemptedUrl: string } | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditPdfOpen, setIsEditPdfOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'pdf' | 'category';
    id: string | number;
    title: string;
  } | null>(null);

  // PDF Preview State
  const [previewPdf, setPreviewPdf] = useState<PdfDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  // Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategoryMode, setUploadCategoryMode] = useState<'select' | 'new'>('select');
  const [uploadSelectedCategory, setUploadSelectedCategory] = useState('');
  const [uploadNewCategoryName, setUploadNewCategoryName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Edit PDF Form state
  const [editPdfTarget, setEditPdfTarget] = useState<PdfDocument | null>(null);
  const [editPdfTitle, setEditPdfTitle] = useState('');
  const [editPdfCategory, setEditPdfCategory] = useState('');
  const [editPdfDescription, setEditPdfDescription] = useState('');
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Category Form state (Create & Edit)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | null>(null);

  // Expandable Category Accordion in "By Category" tab
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const showNotification = useCallback((type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  }, []);

  // Fetch all PDFs and Categories
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [pdfRes, catRes] = await Promise.allSettled([
          adminService.getPdfs(),
          adminService.getPdfCategories(),
        ]);

        let hasSuccess = false;

        if (pdfRes.status === 'fulfilled') {
          setPdfs(pdfRes.value.pdfs || []);
          hasSuccess = true;
        } else {
          console.warn('Failed to fetch PDFs:', pdfRes.reason);
        }

        if (catRes.status === 'fulfilled') {
          const catList = catRes.value || [];
          setCategories(catList);
          hasSuccess = true;

          // Default expand all categories in accordion view
          const initialExpanded: Record<string, boolean> = {};
          catList.forEach((c) => {
            initialExpanded[String(c.id || c.name)] = true;
          });
          setExpandedCategories((prev) => ({ ...initialExpanded, ...prev }));
        } else {
          console.warn('Failed to fetch categories:', catRes.reason);
        }

        if (hasSuccess) {
          setBackendError(null);
        } else {
          const attemptedUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (typeof window !== 'undefined' ? window.location.origin : '');
          const errorMsg =
            pdfRes.status === 'rejected'
              ? getErrorMessage(pdfRes.reason)
              : 'PDF endpoints (/api/pdfs, /api/pdf-categories) returned 404 Not Found';
          setBackendError({ message: errorMsg, attemptedUrl });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        const attemptedUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        setBackendError({ message: getErrorMessage(err), attemptedUrl });
        showNotification('error', getErrorMessage(err, 'Failed to load documents'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived unique categories from PDFs and fetched categories
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.name?.trim()) set.add(c.name.trim());
    });
    pdfs.forEach((p) => {
      const name = p.categoryName || p.category?.name;
      if (name?.trim()) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [categories, pdfs]);

  // Filtered PDFs
  const filteredPdfs = useMemo(() => {
    return pdfs.filter((pdf) => {
      const cat = (pdf.categoryName || pdf.category?.name || '').toLowerCase();
      const title = (pdf.title || '').toLowerCase();
      const desc = (pdf.description || '').toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch = !search || title.includes(search) || desc.includes(search) || cat.includes(search);
      const matchesCategory =
        selectedCategoryFilter === 'ALL' || cat === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [pdfs, searchTerm, selectedCategoryFilter]);

  // Grouped PDFs for "By Category" view
  const groupedPdfs = useMemo(() => {
    const groups: Record<string, { category: PdfCategory | null; pdfs: PdfDocument[] }> = {};

    // First initialize from existing categories
    categories.forEach((cat) => {
      groups[cat.name] = {
        category: cat,
        pdfs: Array.isArray(cat.pdfs) ? [...cat.pdfs] : [],
      };
    });

    // Populate or supplement from pdfs list
    pdfs.forEach((pdf) => {
      const catName = pdf.categoryName || pdf.category?.name || 'Uncategorized';
      if (!groups[catName]) {
        groups[catName] = {
          category: pdf.category
            ? { id: pdf.category.id, name: pdf.category.name, description: pdf.category.description }
            : null,
          pdfs: [],
        };
      }
      // Avoid duplicate insertion
      const exists = groups[catName].pdfs.some((p) => String(p.id) === String(pdf.id));
      if (!exists) {
        groups[catName].pdfs.push(pdf);
      }
    });

    return groups;
  }, [categories, pdfs]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }
    setUploadFile(file);
    if (!uploadTitle.trim()) {
      // Suggest clean title from file name
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanTitle);
    }
  };

  // Open Upload Modal with optional preselected category
  const openUploadModal = (preselectedCategory = '') => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    if (preselectedCategory) {
      setUploadCategoryMode('select');
      setUploadSelectedCategory(preselectedCategory);
    } else if (categoryOptions.length > 0) {
      setUploadCategoryMode('select');
      setUploadSelectedCategory(categoryOptions[0]);
    } else {
      setUploadCategoryMode('new');
      setUploadNewCategoryName('Previous Year Papers');
    }
    setIsUploadOpen(true);
  };

  // Submit Upload PDF
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please choose a PDF file to upload.');
      return;
    }
    if (!uploadTitle.trim()) {
      alert('Please provide a title for the PDF.');
      return;
    }

    const categoryName =
      uploadCategoryMode === 'new' ? uploadNewCategoryName.trim() : uploadSelectedCategory.trim();

    if (!categoryName) {
      alert('Please select or specify a category name.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.uploadPdf({
        file: uploadFile,
        title: uploadTitle.trim(),
        categoryName,
        description: uploadDescription.trim() || undefined,
      });

      showNotification('success', `"${uploadTitle}" uploaded successfully!`);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      await fetchData();
    } catch (err: any) {
      console.error('Upload failed:', err);
      showNotification('error', getErrorMessage(err, 'Failed to upload PDF'));
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (pdf: PdfDocument) => {
    setEditPdfTarget(pdf);
    setEditPdfTitle(pdf.title || '');
    setEditPdfCategory(pdf.categoryName || pdf.category?.name || '');
    setEditPdfDescription(pdf.description || '');
    setEditPdfFile(null);
    setIsEditPdfOpen(true);
  };

  // Submit Edit PDF
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPdfTarget) return;
    if (!editPdfTitle.trim()) {
      alert('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.updatePdf(editPdfTarget.id, {
        title: editPdfTitle.trim(),
        categoryName: editPdfCategory.trim(),
        description: editPdfDescription.trim(),
        file: editPdfFile || undefined,
      });

      showNotification('success', 'PDF updated successfully!');
      setIsEditPdfOpen(false);
      setEditPdfTarget(null);
      await fetchData();
    } catch (err: any) {
      console.error('Update failed:', err);
      showNotification('error', getErrorMessage(err, 'Failed to update PDF'));
    } finally {
      setSubmitting(false);
    }
  };

  // Open Preview Modal
  const handlePreviewPdf = async (pdf: PdfDocument) => {
    setPreviewPdf(pdf);
    setLoadingPreview(true);
    setPreviewUrl(null);

    try {
      // First try fetching authenticated blob for safe embedding
      const blob = await adminService.fetchPdfBlob(pdf.id, 'view');
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
    } catch (err) {
      console.warn('Authenticated blob fetch failed, falling back to direct endpoint view URL:', err);
      const directUrl = adminService.getPdfViewUrl(pdf.id);
      setPreviewUrl(directUrl);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewPdf(null);
    setPreviewUrl(null);
  };

  // Trigger Download
  const handleDownload = async (pdf: PdfDocument) => {
    try {
      await adminService.downloadPdfFile(pdf.id, pdf.title || `paper-${pdf.id}`);
      showNotification('success', `Downloading "${pdf.title}"...`);
    } catch (err: any) {
      console.error('Download failed:', err);
      showNotification('error', getErrorMessage(err, 'Failed to download PDF'));
    }
  };

  // Delete Action Confirm
  const confirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setSubmitting(true);

    try {
      if (deleteConfirmTarget.type === 'pdf') {
        await adminService.deletePdf(deleteConfirmTarget.id);
        showNotification('success', `PDF "${deleteConfirmTarget.title}" deleted.`);
      } else {
        await adminService.deletePdfCategory(deleteConfirmTarget.id);
        showNotification(
          'success',
          `Category "${deleteConfirmTarget.title}" and its PDFs were deleted.`
        );
      }
      setDeleteConfirmTarget(null);
      await fetchData();
    } catch (err: any) {
      console.error('Delete failed:', err);
      showNotification('error', getErrorMessage(err, 'Delete operation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Category Actions
  const openCreateCategory = () => {
    setCategoryForm({ name: '', description: '' });
    setSelectedCategoryId(null);
    setIsCategoryModalOpen(true);
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createPdfCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      });

      showNotification('success', `Category "${categoryForm.name}" created!`);
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '' });
      await fetchData();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      showNotification('error', getErrorMessage(err, 'Failed to create category'));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditCategory = (cat: PdfCategory) => {
    setSelectedCategoryId(cat.id);
    setCategoryForm({
      name: cat.name || '',
      description: cat.description || '',
    });
    setIsEditCategoryOpen(true);
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !categoryForm.name.trim()) return;

    setSubmitting(true);
    try {
      await adminService.updatePdfCategory(selectedCategoryId, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
      });

      showNotification('success', 'Category updated successfully!');
      setIsEditCategoryOpen(false);
      setSelectedCategoryId(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to update category:', err);
      showNotification('error', getErrorMessage(err, 'Failed to update category'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategoryExpand = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{actionMessage.text}</p>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Backend 404 Troubleshooting Alert */}
      {backendError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm flex-1">
              <div className="font-semibold text-amber-950">
                Backend PDF API Not Found (404)
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The backend at{' '}
                <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono text-amber-900 font-semibold">
                  {backendError.attemptedUrl || 'current endpoint'}
                </code>{' '}
                does not have the new PDF routes (<code className="font-mono text-xs">/api/pdfs</code>,{' '}
                <code className="font-mono text-xs">/api/pdf-categories</code>) deployed yet.
              </p>
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <p className="font-semibold text-gray-900">How to fix:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
                  <li>
                    <strong>If developing locally:</strong> Start your backend in{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">TestSeriesBE</code> (
                    <code className="bg-gray-100 px-1 py-0.5 rounded">npm start</code> on port 5001), ensure{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      NEXT_PUBLIC_BASE_URL=&quot;http://localhost:5001&quot;
                    </code>{' '}
                    is in <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code>, and restart Next.js.
                  </li>
                  <li>
                    <strong>If deploying to production:</strong> Commit and push the new files in{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">TestSeriesBE</code> to GitHub so Vercel can redeploy.
                  </li>
                </ul>
              </div>
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchData(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBackendError(null)}
                  className="text-xs text-amber-700 hover:text-amber-900"
                >
                  Dismiss notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Previous Year Papers & PDFs
              </h1>
              <p className="text-sm text-gray-500">
                Upload question papers, categorize study materials, preview, download, and manage PDFs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateCategory}
            className="flex items-center gap-2 px-3.5 py-2 text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => openUploadModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total PDFs
            </div>
            <div className="text-2xl font-bold text-gray-900">{pdfs.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </div>
            <div className="text-2xl font-bold text-gray-900">{categoryOptions.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filtered Results
            </div>
            <div className="text-2xl font-bold text-gray-900">{filteredPdfs.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 gap-4 flex-wrap">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All PDFs ({pdfs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('by-category')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'by-category'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Browse by Category</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Manage Categories ({categoryOptions.length})</span>
          </button>
        </div>

        {/* Quick Search and Filter Bar */}
        {activeTab !== 'categories' && (
          <div className="flex items-center gap-2.5 pb-2 sm:pb-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: ALL PDFS TABLE */}
      {activeTab === 'all' && (
        <section className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Document</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">File Info</th>
                  <th className="py-3.5 px-5">Uploaded</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Loading documents...</p>
                    </td>
                  </tr>
                ) : filteredPdfs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6" />
                        </div>
                        <p className="text-gray-700 font-medium">No PDF documents found</p>
                        <p className="text-xs text-gray-400">
                          {searchTerm || selectedCategoryFilter !== 'ALL'
                            ? 'Try adjusting your search query or category filter.'
                            : 'Get started by uploading your first question paper or study PDF.'}
                        </p>
                        <button
                          onClick={() => openUploadModal()}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPdfs.map((pdf) => {
                    const catName = pdf.categoryName || pdf.category?.name || 'Uncategorized';
                    const sizeFormatted = formatBytes(pdf.fileSize || pdf.file_size || pdf.size);
                    const dateFormatted = formatDateTime(pdf.createdAt || pdf.created_at);

                    return (
                      <tr key={pdf.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-tight truncate max-w-md">
                                {pdf.title || 'Untitled Document'}
                              </p>
                              {pdf.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">
                                  {pdf.description}
                                </p>
                              )}
                              <span className="text-[11px] text-gray-400 font-mono">ID: #{pdf.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Folder className="w-3 h-3 text-indigo-500" />
                            {catName}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">{sizeFormatted}</span>
                            {pdf.filename && (
                              <div className="text-[11px] text-gray-400 font-mono truncate max-w-xs">
                                {pdf.filename}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-gray-500">{dateFormatted}</td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => handlePreviewPdf(pdf)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Preview in browser"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Download */}
                            <button
                              onClick={() => handleDownload(pdf)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Download attachment"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(pdf)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit metadata / replace file"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() =>
                                setDeleteConfirmTarget({
                                  type: 'pdf',
                                  id: pdf.id,
                                  title: pdf.title || `Document #${pdf.id}`,
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete PDF"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB CONTENT 2: BROWSE BY CATEGORY */}
      {activeTab === 'by-category' && (
        <div className="space-y-4">
          {Object.keys(groupedPdfs).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Folder className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No categories available</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Categories are created automatically when you upload PDFs or you can create one directly.
              </p>
              <button
                onClick={openCreateCategory}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Category
              </button>
            </div>
          ) : (
            Object.entries(groupedPdfs).map(([categoryName, group]) => {
              const isExpanded = expandedCategories[categoryName] ?? true;
              const docCount = group.pdfs.length;

              return (
                <div
                  key={categoryName}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden"
                >
                  {/* Category Group Header */}
                  <div
                    onClick={() => toggleCategoryExpand(categoryName)}
                    className="flex items-center justify-between p-4 bg-gray-50/75 hover:bg-gray-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base">{categoryName}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {docCount} {docCount === 1 ? 'file' : 'files'}
                          </span>
                        </div>
                        {group.category?.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{group.category.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openUploadModal(categoryName)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-medium transition-colors"
                        title="Upload PDF into this category"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload to this Category</span>
                      </button>

                      {group.category?.id && (
                        <button
                          onClick={() => openEditCategory(group.category!)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Edit Category Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PDFs inside Category */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-100">
                      {docCount === 0 ? (
                        <div className="py-6 text-center text-gray-400 text-xs">
                          No PDFs uploaded in this category yet.{' '}
                          <button
                            onClick={() => openUploadModal(categoryName)}
                            className="text-indigo-600 font-semibold hover:underline ml-1"
                          >
                            Upload one now
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.pdfs.map((pdf) => (
                            <div
                              key={pdf.id}
                              className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {pdf.title}
                                  </h4>
                                  {pdf.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                      {pdf.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                                    <span>{formatBytes(pdf.fileSize || pdf.file_size || pdf.size)}</span>
                                    <span>•</span>
                                    <span>{formatDateTime(pdf.createdAt || pdf.created_at)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-gray-50">
                                <button
                                  onClick={() => handlePreviewPdf(pdf)}
                                  className="px-2.5 py-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded font-medium flex items-center gap-1 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Preview
                                </button>
                                <button
                                  onClick={() => handleDownload(pdf)}
                                  className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded font-medium flex items-center gap-1 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                                <button
                                  onClick={() => openEditModal(pdf)}
                                  className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmTarget({
                                      type: 'pdf',
                                      id: pdf.id,
                                      title: pdf.title || `Document #${pdf.id}`,
                                    })
                                  }
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <section className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Categories</h3>
              <p className="text-xs text-gray-500">
                Manage PDF categories used to classify previous year papers and study resources.
              </p>
            </div>
            <button
              onClick={openCreateCategory}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Category Name</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">PDF Documents</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                      No categories found. Click &quot;Add Category&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => {
                    const count =
                      cat.pdfCount ?? cat.pdf_count ?? (Array.isArray(cat.pdfs) ? cat.pdfs.length : 0);

                    return (
                      <tr key={cat.id || cat.name} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              <Folder className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                              {cat.id && (
                                <div className="text-[11px] text-gray-400 font-mono">ID: #{cat.id}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-sm text-gray-600">
                          {cat.description || <span className="text-gray-400 italic">No description</span>}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {count} {count === 1 ? 'file' : 'files'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedCategoryFilter(cat.name);
                                setActiveTab('all');
                              }}
                              className="px-2.5 py-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded font-medium transition-colors"
                            >
                              View PDFs
                            </button>

                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {cat.id && (
                              <button
                                onClick={() =>
                                  setDeleteConfirmTarget({
                                    type: 'category',
                                    id: cat.id,
                                    title: cat.name,
                                  })
                                }
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: UPLOAD PDF */}
      {/* ========================================================= */}
      <AdminModal
        open={isUploadOpen}
        onClose={() => !submitting && setIsUploadOpen(false)}
        title="Upload PDF Document"
        subtitle="Upload question papers or study material with category name"
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* File Dropzone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              PDF File <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : uploadFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-gray-300 hover:border-indigo-400 bg-gray-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {uploadFile ? (
                <div className="flex items-center justify-between text-left p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate max-w-xs">
                        {uploadFile.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatBytes(uploadFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFile(null);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to browse or drag and drop your PDF here
                  </p>
                  <p className="text-xs text-gray-400">PDF format up to 50MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2024 Prelims Question Paper"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Selection / Creation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setUploadCategoryMode((prev) => (prev === 'select' ? 'new' : 'select'))
                }
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                {uploadCategoryMode === 'select' ? '+ Type New Category' : '← Select Existing'}
              </button>
            </div>

            {uploadCategoryMode === 'select' && categoryOptions.length > 0 ? (
              <select
                value={uploadSelectedCategory}
                onChange={(e) => setUploadSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Category --</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="e.g. Previous Year Papers, Mains, Mock Test"
                value={uploadNewCategoryName}
                onChange={(e) => setUploadNewCategoryName(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Official question paper with answer key and detailed explanations"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !uploadFile}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Paper</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 2: IN-BROWSER PDF PREVIEW */}
      {/* ========================================================= */}
      <AdminModal
        open={Boolean(previewPdf)}
        onClose={closePreview}
        title={previewPdf?.title || 'PDF Preview'}
        subtitle={`Category: ${previewPdf?.categoryName || previewPdf?.category?.name || 'General'}`}
        maxWidthClass="max-w-5xl"
      >
        <div className="space-y-3">
          {/* Top Preview Controls */}
          <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="font-semibold">{previewPdf?.title}</span>
              {previewPdf?.fileSize && (
                <span className="text-gray-400">({formatBytes(previewPdf.fileSize)})</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {previewPdf && (
                <>
                  <button
                    onClick={() => {
                      const url = previewUrl || adminService.getPdfViewUrl(previewPdf.id);
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </button>

                  <button
                    onClick={() => handleDownload(previewPdf)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Viewer Area */}
          <div className="w-full h-[65vh] bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center relative">
            {loadingPreview ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs text-gray-500 font-medium">Loading PDF document...</p>
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                title={previewPdf?.title || 'PDF Preview'}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="text-center p-6 text-gray-500">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Unable to load inline preview.</p>
                <p className="text-xs text-gray-400 mt-1 mb-3">
                  You can still open or download the PDF directly.
                </p>
                {previewPdf && (
                  <button
                    onClick={() => handleDownload(previewPdf)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
                  >
                    Download File
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 3: EDIT PDF METADATA & REPLACE FILE */}
      {/* ========================================================= */}
      <AdminModal
        open={isEditPdfOpen}
        onClose={() => !submitting && setIsEditPdfOpen(false)}
        title="Edit PDF Document"
        subtitle="Update title, description, category, or replace file"
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editPdfTitle}
              onChange={(e) => setEditPdfTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Previous Year Papers"
              value={editPdfCategory}
              onChange={(e) => setEditPdfCategory(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={editPdfDescription}
              onChange={(e) => setEditPdfDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Replace file option */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace PDF File <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={editFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditPdfFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{editPdfFile ? 'Change Selected File' : 'Choose New PDF'}</span>
              </button>
              {editPdfFile && (
                <div className="flex items-center gap-2 text-xs text-gray-600 truncate flex-1">
                  <span className="font-semibold text-emerald-700 truncate">{editPdfFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setEditPdfFile(null)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsEditPdfOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 4: CREATE DIRECT CATEGORY */}
      {/* ========================================================= */}
      <AdminModal
        open={isCategoryModalOpen}
        onClose={() => !submitting && setIsCategoryModalOpen(false)}
        title="Create PDF Category"
        subtitle="Add a new category classification for organizing PDF papers"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Previous Year Papers"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Past 10 years prelims and mains question papers"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 5: EDIT CATEGORY */}
      {/* ========================================================= */}
      <AdminModal
        open={isEditCategoryOpen}
        onClose={() => !submitting && setIsEditCategoryOpen(false)}
        title="Edit PDF Category"
        subtitle="Update category name or description"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleEditCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsEditCategoryOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 6: DELETE CONFIRMATION */}
      {/* ========================================================= */}
      <AdminModal
        open={Boolean(deleteConfirmTarget)}
        onClose={() => !submitting && setDeleteConfirmTarget(null)}
        title={deleteConfirmTarget?.type === 'pdf' ? 'Delete PDF Document' : 'Delete Category'}
        subtitle="This action cannot be undone"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 text-red-900 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">
                Are you sure you want to delete &quot;{deleteConfirmTarget?.title}&quot;?
              </p>
              {deleteConfirmTarget?.type === 'category' ? (
                <p className="text-xs text-red-700 mt-1">
                  Warning: Deleting this category will delete all associated PDF files from the database and disk!
                </p>
              ) : (
                <p className="text-xs text-red-700 mt-1">
                  The file will be permanently removed from disk and database records.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDeleteConfirmTarget(null)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
