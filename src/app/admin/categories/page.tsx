'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2, Search, Plus, Edit, Trash2, Folder } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories();
      const data = res.data?.categories || res.data || res;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return alert('Name is required');
    setSubmitting(true);
    try {
      await adminService.createCategory(form);
      alert('Category created successfully!');
      setIsCreateOpen(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create Category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !selectedId) return alert('Name is required');
    setSubmitting(true);
    try {
      await adminService.updateCategory(selectedId, form);
      alert('Category updated successfully!');
      setIsEditOpen(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update Category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(id);
        alert('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete category');
      }
    }
  };

  const openEditModal = (item: any) => {
    setSelectedId(item.id);
    setForm({
      name: item.name || '',
      description: item.description || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-sm text-gray-500">Manage categories used for organizing test series.</p>
        </div>
        <button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">No categories found.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-sm text-gray-500">#{cat.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-600">{cat.description || '-'}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal for Create/Edit Category */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{isEditOpen ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Loader2 className="w-5 h-5 hidden" />
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
            <form onSubmit={isEditOpen ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} {isEditOpen ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
