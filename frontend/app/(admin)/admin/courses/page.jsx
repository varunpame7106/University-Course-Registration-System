'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, BookOpen, Clock, Globe, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';

const courseSchema = z.object({
  course_name: z.string().min(1, 'Required'),
  dept_id: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
  mode: z.enum(['Online', 'Offline']),
  platform: z.string().optional(),
  college_name: z.string().optional(),
  timing: z.string().min(1, 'Required'),
  faculty_ids: z.array(z.string()).optional(),
});

const fetchCourses = ({ page, search }) =>
  api.get('/admin/courses', { params: { page, limit: 10, search } }).then((r) => r.data);
const fetchDepts = () => api.get('/admin/departments').then((r) => r.data.data);
const fetchFaculties = () => api.get('/admin/faculties', { params: { limit: 100 } }).then((r) => r.data.data);

export default function CoursesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', course: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, course: null });

  const { data, isLoading } = useQuery({ queryKey: ['admin-courses', page, search], queryFn: () => fetchCourses({ page, search }) });
  const { data: depts = [] } = useQuery({ queryKey: ['depts'], queryFn: fetchDepts });
  const { data: allFaculty = [] } = useQuery({ queryKey: ['all-faculty'], queryFn: fetchFaculties });

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm({ resolver: zodResolver(courseSchema) });
  const mode = watch('mode');

  const openAdd = () => { reset({ faculty_ids: [] }); setModal({ open: true, mode: 'add', course: null }); };
  const openEdit = (c) => {
    reset({
      course_name: c.course_name, dept_id: String(c.dept_id), duration: c.duration,
      mode: c.mode, platform: c.platform || '', college_name: c.college_name || '',
      timing: c.timing, faculty_ids: c.courseFaculty?.map((cf) => String(cf.faculty.faculty_id)) || [],
    });
    setModal({ open: true, mode: 'edit', course: c });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/admin/courses', d),
    onSuccess: () => { toast.success('Course created successfully'); qc.invalidateQueries({ queryKey: ['admin-courses'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to create course'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/courses/${id}`, data),
    onSuccess: () => { toast.success('Course updated'); qc.invalidateQueries({ queryKey: ['admin-courses'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update course'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/courses/${id}`),
    onSuccess: () => { toast.success('Course deleted'); qc.invalidateQueries({ queryKey: ['admin-courses'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to delete course'),
  });

  const onSubmit = (values) => {
    const payload = { ...values };
    if (modal.mode === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: modal.course.course_id, data: payload });
  };

  const handleSearch = useCallback((val) => { setSearch(val); setPage(1); }, []);

  const columns = [
    { 
      key: 'course_name', 
      label: 'Course Details',
      render: (v, r) => (
        <div className="flex flex-col">
          <span className="font-bold text-primary-900">{v}</span>
          <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{r.department?.dept_name}</span>
        </div>
      )
    },
    { 
      key: 'mode', 
      label: 'Delivery', 
      render: (v, r) => (
        <div className="flex items-center gap-2">
          <Badge variant={v.toLowerCase()} />
          <span className="text-xs text-muted font-medium">{v === 'Online' ? r.platform : r.college_name}</span>
        </div>
      )
    },
    { 
      key: 'timing', 
      label: 'Schedule', 
      render: (v, r) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-primary-700">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">{v}</span>
          </div>
          <span className="text-[10px] text-muted font-mono">{r.duration}</span>
        </div>
      )
    },
    { 
      key: 'courseFaculty', 
      label: 'Faculty', 
      render: (v) => (
        <div className="flex -space-x-2 overflow-hidden">
          {v?.length > 0 ? v.map((cf, i) => (
            <div key={i} title={`${cf.faculty.first_name} ${cf.faculty.last_name}`} className="w-7 h-7 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600">
              {cf.faculty.first_name[0]}
            </div>
          )) : <span className="text-xs text-muted italic">Not Assigned</span>}
        </div>
      )
    },
    {
      key: 'created_by_role',
      label: 'Source',
      render: (v, r) => (
        <div className="flex flex-col">
          <Badge variant={v === 'ADMIN' ? 'approved' : 'pending'} />
          <span className="text-[9px] font-bold text-muted mt-1 uppercase">
            {v === 'ADMIN' ? 'Administrator' : `${r.creatorFaculty?.first_name} ${r.creatorFaculty?.last_name}`}
          </span>
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="btn-icon btn-ghost text-accent"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteModal({ open: true, course: row })} className="btn-icon btn-ghost text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-inner">
      <PageHeader
        title="Course Curriculum"
        subtitle={`Managing ${data?.pagination?.total ?? 0} active academic programs`}
        action={
          <button onClick={openAdd} className="btn-primary shadow-lg shadow-accent/20" id="add-course-btn">
            <Plus className="w-4 h-4" /> Create New Course
          </button>
        }
      />
      
      <div className="card">
        <DataTable 
          columns={columns} 
          data={data?.data || []} 
          loading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage} 
          onSearch={handleSearch} 
          searchPlaceholder="Search curriculum..." 
        />
      </div>

      <Modal 
        open={modal.open} 
        onClose={() => setModal({ open: false })} 
        title={modal.mode === 'add' ? 'Design New Course' : 'Modify Course Specifications'}
        footer={
          <>
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending} className="btn-primary">
              {createMut.isPending || updateMut.isPending ? 'Processing...' : 'Publish Course'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="form-label">Course Title</label>
              <input {...register('course_name')} className={errors.course_name ? 'form-input-error' : 'form-input'} placeholder="e.g. Advanced Machine Learning" />
              {errors.course_name && <p className="form-error">{errors.course_name.message}</p>}
            </div>

            <div>
              <label className="form-label">Offering Department</label>
              <select {...register('dept_id')} className={errors.dept_id ? 'form-input-error' : 'form-select'}>
                <option value="">Select Department</option>
                {depts.map((d) => <option key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</option>)}
              </select>
              {errors.dept_id && <p className="form-error">{errors.dept_id.message}</p>}
            </div>

            <div>
              <label className="form-label">Credit Hours / Duration</label>
              <input {...register('duration')} className={errors.duration ? 'form-input-error' : 'form-input'} placeholder="e.g. 4 Credits / 45 Hrs" />
              {errors.duration && <p className="form-error">{errors.duration.message}</p>}
            </div>

            <div>
              <label className="form-label">Delivery Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-primary-50 p-1 rounded-xl">
                {['Online', 'Offline'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue('mode', m)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      mode === m ? 'bg-white text-accent shadow-sm' : 'text-muted hover:text-primary-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('mode')} />
            </div>

            <div>
              <label className="form-label">Weekly Schedule</label>
              <input {...register('timing')} className={errors.timing ? 'form-input-error' : 'form-input'} placeholder="e.g. Tue, Thu 09:00 - 11:00" />
              {errors.timing && <p className="form-error">{errors.timing.message}</p>}
            </div>

            {mode === 'Online' && (
              <div className="col-span-full animate-in slide-in-from-top-2 duration-300">
                <label className="form-label">Virtual Platform</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input {...register('platform')} className={errors.platform ? 'form-input-error pl-10' : 'form-input pl-10'} placeholder="e.g. Microsoft Teams" />
                </div>
              </div>
            )}
            
            {mode === 'Offline' && (
              <div className="col-span-full animate-in slide-in-from-top-2 duration-300">
                <label className="form-label">Physical Campus / Room</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input {...register('college_name')} className={errors.college_name ? 'form-input-error pl-10' : 'form-input pl-10'} placeholder="e.g. Block C, Room 102" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="form-label flex items-center justify-between">
              <span>Assign Faculty Members</span>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Multi-select enabled</span>
            </label>
            <Controller name="faculty_ids" control={control} render={({ field }) => (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 bg-primary-50 rounded-xl border border-primary-100 scrollbar-hide">
                {allFaculty.map((f) => {
                  const isSelected = field.value?.includes(String(f.faculty_id));
                  return (
                    <label key={f.faculty_id} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'bg-white border-accent shadow-sm ring-1 ring-accent' : 'hover:bg-primary-100/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-accent text-white' : 'bg-primary-200 text-primary-600'
                        }`}>
                          {f.first_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-primary-700'}`}>
                            {f.first_name} {f.last_name}
                          </span>
                          <span className="text-[10px] text-muted">{f.department?.dept_name}</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={(e) => {
                          const current = field.value || [];
                          if (e.target.checked) field.onChange([...current, String(f.faculty_id)]);
                          else field.onChange(current.filter(id => id !== String(f.faculty_id)));
                        }}
                      />
                      {isSelected && <Check className="w-4 h-4 text-accent" />}
                    </label>
                  );
                })}
              </div>
            )} />
          </div>
        </div>
      </Modal>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} title="Decommission Course"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Keep Course</button>
            <button onClick={() => deleteMut.mutate(deleteModal.course?.course_id)} disabled={deleteMut.isPending} className="btn-danger shadow-lg shadow-danger/20">
              {deleteMut.isPending ? 'Decommissioning...' : 'Confirm Decommission'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-danger-soft rounded-full flex items-center justify-center text-danger mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-primary-900 font-bold text-lg mb-1">Archive Course?</p>
          <p className="text-muted text-sm max-w-xs">
            Archiving <strong className="text-primary-900">{deleteModal.course?.course_name}</strong> will remove it from the curriculum and drop all active enrolments.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function Check(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
}
