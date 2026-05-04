'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Eye, Trash2, Library, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

// Public read endpoint — baseURL already includes /api, so path starts at /resources/
const fetchLibrary = async ({ search, category }) => {
  const params = {};
  if (search) params.search = search;
  if (category && category !== 'All') params.category = category;
  const res = await api.get('/resources/library', { params });
  return res.data.data || [];
};

const categories = ['All', 'Engineering', 'Computer Science', 'Civil', 'Mechanical', 'Electronics', 'Management'];

export default function AdminLibraryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [detailsModal, setDetailsModal] = useState({ open: false, resource: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, resource: null });

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['admin-library', search, category],
    queryFn: () => fetchLibrary({ search, category }),
    staleTime: 30000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/resources/admin/library/remove/${id}`),
    onSuccess: () => {
      toast.success('Resource deleted');
      qc.invalidateQueries({ queryKey: ['admin-library'] });
      setDeleteModal({ open: false, resource: null });
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'title', 
      label: 'Title', 
      render: (val) => <span className="font-bold text-primary-900">{val}</span> 
    },
    { key: 'subject', label: 'Subject' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { 
      key: 'uploaded_by_name', 
      label: 'Uploaded By', 
      render: (val) => (
        <span className="text-slate-600 text-sm">{val || 'System/Admin'}</span>
      )
    },
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
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {/* View Details */}
          <button 
            onClick={() => setDetailsModal({ open: true, resource: row })} 
            className="btn-ghost btn-sm btn-icon text-primary"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {/* Open File */}
          <a 
            href={row.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-ghost btn-sm btn-icon text-blue-600"
            title="Open/Download File"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {/* Admin Delete */}
          <button 
            onClick={() => setDeleteModal({ open: true, resource: row })}
            className="btn-ghost btn-sm btn-icon text-danger"
            title="Delete Resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manage Digital Library"
        subtitle="View all academic books and uploaded resources — Admin can delete any resource"
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          Failed to load library resources. Please refresh the page.
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-primary-900">All Library Resources</h3>
              <p className="text-xs text-muted">{resources.length} total resources</p>
            </div>
          </div>
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

        <DataTable
          columns={columns}
          data={resources}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="Search by title, subject or author..."
        />
      </div>

      {/* Details Modal */}
      <Modal
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false })}
        title="Resource Details"
        footer={
          <div className="flex items-center justify-between w-full">
            <a
              href={detailsModal.resource?.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open File
            </a>
            <button onClick={() => setDetailsModal({ open: false })} className="btn-primary">
              Close
            </button>
          </div>
        }
      >
        {detailsModal.resource && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</p>
              <p className="font-bold text-primary-900 text-lg">{detailsModal.resource.title}</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                <p className="font-medium text-slate-700">{detailsModal.resource.subject}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`badge ${detailsModal.resource.status === 'Active' ? 'badge-approved' : 'badge-pending'}`}>
                  {detailsModal.resource.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Uploaded By</p>
              <p className="font-medium text-slate-700">{detailsModal.resource.uploaded_by_name || 'System/Admin'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {detailsModal.resource.description || 'No description provided.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Resource"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button onClick={() => setDeleteModal({ open: false, resource: null })} className="btn-secondary">
              Cancel
            </button>
            <button 
              onClick={() => deleteMut.mutate(deleteModal.resource?.id)} 
              disabled={deleteMut.isPending} 
              className="btn-danger min-w-[100px]"
            >
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-primary-900 mb-1">Confirm Deletion</h3>
          <p className="text-sm text-muted max-w-xs">
            Are you sure you want to delete{' '}
            <strong className="text-primary">{deleteModal.resource?.title}</strong>?{' '}
            This cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
