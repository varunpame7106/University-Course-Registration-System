'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const fetchGrading = () => api.get('/resources/grading').then((r) => r.data.data);

export default function AdminGradingPage() {
  const qc = useQueryClient();
  const [componentModal, setComponentModal] = useState({ open: false, mode: 'add', item: null });
  const [scaleModal, setScaleModal] = useState({ open: false, mode: 'add', item: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-grading'],
    queryFn: fetchGrading,
  });

  const { register: regComp, handleSubmit: handComp, reset: resComp } = useForm();
  const { register: regScale, handleSubmit: handScale, reset: resScale } = useForm();

  // Mutations
  const updateCompMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/resources/admin/grading/component/${id || ''}`, data),
    onSuccess: () => { toast.success('Component updated'); qc.invalidateQueries({ queryKey: ['admin-grading'] }); setComponentModal({ open: false }); },
  });

  const deleteCompMut = useMutation({
    mutationFn: (id) => api.delete(`/resources/admin/grading/component/${id}`),
    onSuccess: () => { toast.success('Component deleted'); qc.invalidateQueries({ queryKey: ['admin-grading'] }); },
  });

  const scaleMut = useMutation({
    mutationFn: ({ id, data, mode }) => mode === 'add' 
      ? api.post('/resources/admin/grading/scale', data) 
      : api.put(`/resources/admin/grading/scale/${id}`, data),
    onSuccess: () => { toast.success('Scale updated'); qc.invalidateQueries({ queryKey: ['admin-grading'] }); setScaleModal({ open: false }); },
  });

  const deleteScaleMut = useMutation({
    mutationFn: (id) => api.delete(`/resources/admin/grading/scale/${id}`),
    onSuccess: () => { toast.success('Scale deleted'); qc.invalidateQueries({ queryKey: ['admin-grading'] }); },
  });

  if (isLoading) return <div className="p-10 text-center">Loading grading system...</div>;

  const totalMarks = data?.components?.reduce((sum, c) => sum + c.marks, 0) || 0;

  return (
    <div className="pt-6">
      <PageHeader
        title="Manage Grading Rubric"
        subtitle="Define assessment components and grade scales"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assessment Components */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-900">Assessment Components</h2>
            <button 
              onClick={() => { resComp({}); setComponentModal({ open: true, mode: 'add', item: null }); }}
              className="btn-ghost btn-sm text-accent gap-1"
            >
              <Plus className="w-4 h-4" /> Add Component
            </button>
          </div>

          <div className="space-y-4">
            {data?.components?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group">
                <div>
                  <p className="font-bold text-primary-900">{c.component}</p>
                  <p className="text-xs text-muted">Weightage: {c.marks} Marks</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { resComp(c); setComponentModal({ open: true, mode: 'edit', item: c }); }}
                    className="btn-ghost btn-sm btn-icon text-accent"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => deleteCompMut.mutate(c.id)}
                    className="btn-ghost btn-sm btn-icon text-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Weightage</span>
              <span className={`text-lg font-bold ${totalMarks === 100 ? 'text-green-600' : 'text-danger'}`}>
                {totalMarks} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Grade Scale */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-900">Grade Scale</h2>
            <button 
               onClick={() => { resScale({}); setScaleModal({ open: true, mode: 'add', item: null }); }}
               className="btn-ghost btn-sm text-accent gap-1"
            >
              <Plus className="w-4 h-4" /> Add Grade
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left">
                  <th className="pb-3 font-medium">Grade</th>
                  <th className="pb-3 font-medium">Min %</th>
                  <th className="pb-3 font-medium">Max %</th>
                  <th className="pb-3 font-medium">GPA</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.scales?.map((s) => (
                  <tr key={s.id} className="group">
                    <td className="py-3 font-bold text-primary-900">{s.grade}</td>
                    <td className="py-3 text-slate-600">{s.minPercent}%</td>
                    <td className="py-3 text-slate-600">{s.maxPercent}%</td>
                    <td className="py-3 text-slate-600">{s.gpa.toFixed(1)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { resScale(s); setScaleModal({ open: true, mode: 'edit', item: s }); }}
                          className="btn-ghost btn-xs btn-icon text-accent"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => deleteScaleMut.mutate(s.id)}
                          className="btn-ghost btn-xs btn-icon text-danger"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Component Modal */}
      <Modal
        open={componentModal.open}
        onClose={() => setComponentModal({ open: false })}
        title={componentModal.mode === 'add' ? 'Add Component' : 'Edit Component'}
        footer={
          <>
            <button onClick={() => setComponentModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={handComp(d => updateCompMut.mutate({ id: componentModal.item?.id, data: { ...d, marks: parseInt(d.marks) } }))} className="btn-primary">
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Component Name</label>
            <input {...regComp('component')} className="form-input" placeholder="e.g. Mid Sem Exam" />
          </div>
          <div>
            <label className="form-label">Weightage (Marks)</label>
            <input {...regComp('marks')} type="number" className="form-input" placeholder="e.g. 30" />
          </div>
        </div>
      </Modal>

      {/* Scale Modal */}
      <Modal
        open={scaleModal.open}
        onClose={() => setScaleModal({ open: false })}
        title={scaleModal.mode === 'add' ? 'Add Grade' : 'Edit Grade'}
        footer={
          <>
            <button onClick={() => setScaleModal({ open: false })} className="btn-secondary">Cancel</button>
            <button 
              onClick={handScale(d => scaleMut.mutate({ 
                id: scaleModal.item?.id, 
                mode: scaleModal.mode,
                data: { 
                  ...d, 
                  minPercent: parseInt(d.minPercent), 
                  maxPercent: parseInt(d.maxPercent),
                  gpa: parseFloat(d.gpa)
                } 
              }))} 
              className="btn-primary"
            >
              Save
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Grade</label>
            <input {...regScale('grade')} className="form-input" placeholder="e.g. A+" />
          </div>
          <div>
            <label className="form-label">GPA Value</label>
            <input {...regScale('gpa')} type="number" step="0.1" className="form-input" placeholder="e.g. 9.0" />
          </div>
          <div>
            <label className="form-label">Min %</label>
            <input {...regScale('minPercent')} type="number" className="form-input" />
          </div>
          <div>
            <label className="form-label">Max %</label>
            <input {...regScale('maxPercent')} type="number" className="form-input" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
