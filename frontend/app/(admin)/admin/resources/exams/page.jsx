'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const examSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code required'),
  subjectName: z.string().min(1, 'Subject name required'),
  semester: z.string().min(1, 'Semester required'),
  examDate: z.string().min(1, 'Date required'),
  startTime: z.string().min(1, 'Start time required'),
  duration: z.string().min(1, 'Duration required'),
  hall: z.string().min(1, 'Hall/Mode required'),
  status: z.enum(['Upcoming', 'Completed', 'Cancelled']),
});

const fetchExams = ({ search, semester }) =>
  api.get('/resources/exams', { params: { search, semester } }).then((r) => r.data);

export default function AdminExamsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('All');
  const [modal, setModal] = useState({ open: false, mode: 'add', exam: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, exam: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-exams', search, semester],
    queryFn: () => fetchExams({ search, semester }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(examSchema),
  });

  const openAdd = () => { reset({ status: 'Upcoming' }); setModal({ open: true, mode: 'add', exam: null }); };
  const openEdit = (e) => {
    reset({
      ...e,
      examDate: e.examDate ? e.examDate.split('T')[0] : '',
    });
    setModal({ open: true, mode: 'edit', exam: e });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/resources/admin/exams', d),
    onSuccess: () => { toast.success('Exam scheduled'); qc.invalidateQueries({ queryKey: ['admin-exams'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/resources/admin/exams/${id}`, data),
    onSuccess: () => { toast.success('Exam updated'); qc.invalidateQueries({ queryKey: ['admin-exams'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/resources/admin/exams/${id}`),
    onSuccess: () => { toast.success('Exam deleted'); qc.invalidateQueries({ queryKey: ['admin-exams'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to delete'),
  });

  const onSubmit = (values) => {
    if (modal.mode === 'add') {
      createMut.mutate(values);
    } else {
      updateMut.mutate({ id: modal.exam.id, data: values });
    }
  };

  const columns = [
    { key: 'subjectCode', label: 'Code' },
    { key: 'subjectName', label: 'Subject', render: (val) => <span className="font-bold text-primary-900">{val}</span> },
    { key: 'semester', label: 'Semester' },
    { 
      key: 'examDate', 
      label: 'Date', 
      render: (val) => new Date(val).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
    },
    { key: 'startTime', label: 'Time' },
    { key: 'hall', label: 'Hall/Mode' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => (
        <span className={`badge ${val === 'Upcoming' ? 'badge-approved' : val === 'Completed' ? 'badge-online' : 'badge-dropped'}`}>
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
          <button onClick={() => setDeleteModal({ open: true, exam: row })} className="btn-ghost btn-sm btn-icon text-danger">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-6">
      <PageHeader
        title="Manage Examination Schedule"
        subtitle="Schedule and organize semester examinations"
        action={<button onClick={openAdd} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" />Add Exam</button>}
      />

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
           <select 
             value={semester} 
             onChange={(e) => setSemester(e.target.value)}
             className="form-select w-48"
           >
             <option value="All">All Semesters</option>
             {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Sem ${s}`}>Sem {s}</option>)}
           </select>
        </div>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="Search by subject name or code..."
        />
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Schedule Exam' : 'Edit Exam Schedule'}
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
          <div>
            <label className="form-label">Subject Code</label>
            <input {...register('subjectCode')} className={errors.subjectCode ? 'form-input-error' : 'form-input'} placeholder="e.g. CS301" />
            {errors.subjectCode && <p className="form-error">{errors.subjectCode.message}</p>}
          </div>
          <div>
            <label className="form-label">Subject Name</label>
            <input {...register('subjectName')} className={errors.subjectName ? 'form-input-error' : 'form-input'} />
            {errors.subjectName && <p className="form-error">{errors.subjectName.message}</p>}
          </div>
          <div>
            <label className="form-label">Semester</label>
            <select {...register('semester')} className={errors.semester ? 'form-input-error' : 'form-select'}>
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
            </select>
            {errors.semester && <p className="form-error">{errors.semester.message}</p>}
          </div>
          <div>
            <label className="form-label">Exam Date</label>
            <input {...register('examDate')} type="date" className={errors.examDate ? 'form-input-error' : 'form-input'} />
            {errors.examDate && <p className="form-error">{errors.examDate.message}</p>}
          </div>
          <div>
            <label className="form-label">Start Time</label>
            <input {...register('startTime')} type="time" className={errors.startTime ? 'form-input-error' : 'form-input'} />
            {errors.startTime && <p className="form-error">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="form-label">Duration</label>
            <input {...register('duration')} className={errors.duration ? 'form-input-error' : 'form-input'} placeholder="e.g. 3 Hours" />
            {errors.duration && <p className="form-error">{errors.duration.message}</p>}
          </div>
          <div>
            <label className="form-label">Hall Name / Mode</label>
            <input {...register('hall')} className={errors.hall ? 'form-input-error' : 'form-input'} placeholder="e.g. Hall A or Online" />
            {errors.hall && <p className="form-error">{errors.hall.message}</p>}
          </div>
          <div>
            <label className="form-label">Status</label>
            <select {...register('status')} className="form-select">
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Exam Schedule"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.exam?.id)} disabled={deleteMut.isPending} className="btn-danger">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete the exam schedule for <strong className="text-primary">{deleteModal.exam?.subjectName}</strong>?
        </p>
      </Modal>
    </div>
  );
}
