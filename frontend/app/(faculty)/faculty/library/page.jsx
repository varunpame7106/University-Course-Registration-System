'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ExternalLink, Library, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/authStore';

const librarySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url('Invalid URL').or(z.string().min(1, 'File URL required')),
  status: z.enum(['Active', 'Hidden']),
});

// Faculty-scoped endpoint — returns ONLY this faculty's own uploads (enforced server-side)
const fetchLibrary = async ({ search, category }) => {
  const params = {};
  if (search) params.search = search;
  if (category && category !== 'All') params.category = category;
  const res = await api.get('/resources/faculty/library', { params });
  return res.data.data || [];
};

const categories = ['All', 'Engineering', 'Computer Science', 'Civil', 'Mechanical', 'Electronics', 'Management'];

export default function FacultyLibraryPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState({ open: false, mode: 'add', resource: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, resource: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, resource: null });

  const { data, isLoading } = useQuery({
    queryKey: ['faculty-library', search, category],
    queryFn: () => fetchLibrary({ search, category }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(librarySchema),
  });

  const openAdd = () => { reset({ status: 'Active', title: '', subject: '', author: '', category: '', fileUrl: '', description: '' }); setModal({ open: true, mode: 'add', resource: null }); };
  const openEdit = (r) => {
    reset(r);
    setModal({ open: true, mode: 'edit', resource: r });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/resources/admin/library', d),
    onSuccess: () => { toast.success('Resource added'); qc.invalidateQueries({ queryKey: ['faculty-library'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/resources/admin/library/${id}`, data),
    onSuccess: () => { toast.success('Resource updated'); qc.invalidateQueries({ queryKey: ['faculty-library'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/resources/admin/library/${id}`),
    onSuccess: () => { toast.success('Resource deleted'); qc.invalidateQueries({ queryKey: ['faculty-library'] }); setDeleteModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  });

  const onSubmit = (values) => {
    if (modal.mode === 'add') {
      createMut.mutate(values);
    } else {
      updateMut.mutate({ id: modal.resource.id, data: values });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title', render: (val) => <span className="font-bold text-primary-900">{val}</span> },
    { key: 'subject', label: 'Subject' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'uploaded_by_name', label: 'Uploaded By', render: (val) => val || 'System/Admin' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => (
        <span className={`badge ${val === 'Active' ? 'badge-approved' : 'badge-pending'}`}>
          {val}
        </span>
      ) 
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => {
        const isOwner = row.uploaded_by_faculty_id === user?.entity_id;
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setDetailsModal({ open: true, resource: row }); }} 
              className="btn-ghost btn-sm btn-icon text-primary"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {isOwner && (
              <>
                <button onClick={() => openEdit(row)} className="btn-ghost btn-sm btn-icon text-accent" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteModal({ open: true, resource: row })} className="btn-ghost btn-sm btn-icon text-danger" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm btn-icon text-blue-600" title="Open File">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <div className="pt-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manage Digital Library"
        subtitle="Upload and manage academic books, notes and references"
        action={
          <button onClick={openAdd} className="btn-primary btn-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        }
      />

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-primary-900">Resource List</h3>
              <p className="text-xs text-muted">Showing all academic resources</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data || []}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="Search by title, subject or author..."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Add Resource' : 'Edit Resource'}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button 
              onClick={handleSubmit(onSubmit)} 
              disabled={createMut.isPending || updateMut.isPending} 
              className="btn-primary min-w-[100px]"
            >
              {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="form-label">Book Title *</label>
            <input 
              {...register('title')} 
              placeholder="e.g. Advanced Machine Learning"
              className={errors.title ? 'form-input-error' : 'form-input'} 
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="form-label">Subject *</label>
            <input 
              {...register('subject')} 
              placeholder="e.g. Computer Science"
              className={errors.subject ? 'form-input-error' : 'form-input'} 
            />
            {errors.subject && <p className="form-error">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="form-label">Author *</label>
            <input 
              {...register('author')} 
              placeholder="e.g. John Doe"
              className={errors.author ? 'form-input-error' : 'form-input'} 
            />
            {errors.author && <p className="form-error">{errors.author.message}</p>}
          </div>
          <div>
            <label className="form-label">Category *</label>
            <select {...register('category')} className={errors.category ? 'form-input-error' : 'form-select'}>
              <option value="">Select Category</option>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="form-error">{errors.category.message}</p>}
          </div>
          <div>
            <label className="form-label">Status</label>
            <select {...register('status')} className="form-select">
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label">File URL (PDF / Resource Link) *</label>
            <input 
              {...register('fileUrl')} 
              className={errors.fileUrl ? 'form-input-error' : 'form-input'} 
              placeholder="https://example.com/book.pdf" 
            />
            {errors.fileUrl && <p className="form-error">{errors.fileUrl.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="form-label">Description</label>
            <textarea 
              {...register('description')} 
              placeholder="Provide a brief description of the resource..."
              className="form-input h-24 resize-none" 
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Resource"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.resource?.id)} disabled={deleteMut.isPending} className="btn-danger min-w-[100px]">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-primary-900 mb-2">Confirm Deletion</h3>
          <p className="text-sm text-muted max-w-xs">
            Are you sure you want to delete <strong className="text-primary">{deleteModal.resource?.title}</strong>? This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false })}
        title="Resource Details"
        footer={<button onClick={() => setDetailsModal({ open: false })} className="btn-primary">Close</button>}
      >
        {detailsModal.resource && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</p>
              <p className="font-bold text-primary-900">{detailsModal.resource.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Author</p>
                <p className="font-medium text-slate-700">{detailsModal.resource.author}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                <p className="font-medium text-slate-700">{detailsModal.resource.category}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</p>
              <p className="font-medium text-slate-700">{detailsModal.resource.subject}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Uploaded By</p>
              <p className="font-medium text-slate-700">{detailsModal.resource.uploaded_by_name || 'System/Admin'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
              <p className="text-sm text-slate-600 italic">
                {detailsModal.resource.description || 'No description provided.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
