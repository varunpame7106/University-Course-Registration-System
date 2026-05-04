'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const holidaySchema = z.object({
  title: z.string().min(1, 'Holiday name required'),
  date: z.string().min(1, 'Date required'),
  type: z.enum(['Public', 'University', 'Event', 'Vacation']),
  description: z.string().optional(),
  status: z.enum(['Active', 'Hidden']),
});

const fetchHolidays = ({ search, type }) =>
  api.get('/resources/holidays', { params: { search, type } }).then((r) => r.data);

export default function AdminHolidaysPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [modal, setModal] = useState({ open: false, mode: 'add', holiday: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, holiday: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-holidays', search, type],
    queryFn: () => fetchHolidays({ search, type }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(holidaySchema),
  });

  const openAdd = () => { reset({ status: 'Active', type: 'Public' }); setModal({ open: true, mode: 'add', holiday: null }); };
  const openEdit = (h) => {
    reset({
      ...h,
      date: h.date ? h.date.split('T')[0] : '',
    });
    setModal({ open: true, mode: 'edit', holiday: h });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/resources/admin/holidays', d),
    onSuccess: () => { toast.success('Holiday added'); qc.invalidateQueries({ queryKey: ['admin-holidays'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/resources/admin/holidays/${id}`, data),
    onSuccess: () => { toast.success('Holiday updated'); qc.invalidateQueries({ queryKey: ['admin-holidays'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/resources/admin/holidays/${id}`),
    onSuccess: () => { toast.success('Holiday deleted'); qc.invalidateQueries({ queryKey: ['admin-holidays'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to delete'),
  });

  const onSubmit = (values) => {
    if (modal.mode === 'add') {
      createMut.mutate(values);
    } else {
      updateMut.mutate({ id: modal.holiday.id, data: values });
    }
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date', 
      render: (val) => new Date(val).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
    },
    { key: 'title', label: 'Holiday Name', render: (val) => <span className="font-bold text-primary-900">{val}</span> },
    { 
      key: 'type', 
      label: 'Type',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
          val === 'Public' ? 'bg-red-50 text-red-600 border border-red-100' :
          val === 'University' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
          val === 'Vacation' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
          'bg-orange-50 text-orange-600 border border-orange-100'
        }`}>
          {val}
        </span>
      )
    },
    { key: 'description', label: 'Description', render: (val) => <span className="text-xs text-muted line-clamp-1">{val || '—'}</span> },
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
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="btn-ghost btn-sm btn-icon text-accent">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteModal({ open: true, holiday: row })} className="btn-ghost btn-sm btn-icon text-danger">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-6">
      <PageHeader
        title="Manage Holiday Calendar"
        subtitle="Configure university holidays and academic events"
        action={<button onClick={openAdd} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" />Add Holiday</button>}
      />

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
           <select 
             value={type} 
             onChange={(e) => setType(e.target.value)}
             className="form-select w-48"
           >
             <option value="All">All Types</option>
             {['Public', 'University', 'Event', 'Vacation'].map(t => <option key={t} value={t}>{t}</option>)}
           </select>
        </div>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="Search by holiday name..."
        />
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Add Holiday' : 'Edit Holiday'}
        footer={
          <>
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending} className="btn-primary">
              {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Holiday Name</label>
            <input {...register('title')} className={errors.title ? 'form-input-error' : 'form-input'} placeholder="e.g. Diwali Break" />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="form-label">Date</label>
            <input {...register('date')} type="date" className={errors.date ? 'form-input-error' : 'form-input'} />
            {errors.date && <p className="form-error">{errors.date.message}</p>}
          </div>
          <div>
            <label className="form-label">Type</label>
            <select {...register('type')} className={errors.type ? 'form-input-error' : 'form-select'}>
              {['Public', 'University', 'Event', 'Vacation'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <p className="form-error">{errors.type.message}</p>}
          </div>
          <div>
            <label className="form-label">Status</label>
            <select {...register('status')} className="form-select">
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label">Description (Optional)</label>
            <textarea {...register('description')} className="form-input h-24 resize-none" />
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Holiday"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.holiday?.id)} disabled={deleteMut.isPending} className="btn-danger">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete <strong className="text-primary">{deleteModal.holiday?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
