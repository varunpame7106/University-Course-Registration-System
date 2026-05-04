'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Clock, Calendar, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';
import EditScheduleModal from '@/components/faculty/EditScheduleModal';

const fetchSchedule = () => api.get('/faculty/schedule').then((r) => r.data.data);

export default function FacultySchedulePage() {
  const { data: schedule = [], isLoading } = useQuery({ queryKey: ['faculty-schedule'], queryFn: fetchSchedule });
  const [editModal, setEditModal] = useState({ open: false, item: null });

  if (isLoading) return (
    <div className="pt-6">
      <div className="skeleton h-8 w-32 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card skeleton h-20" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader title="My Schedule" subtitle="Assigned course timings" />

      {schedule.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          <p className="text-2xl mb-2">📅</p>
          <p>No schedule found. Courses will appear here once assigned.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedule.map((item, i) => (
            <div key={i} className="card group hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <span className="font-bold text-sm">#{i + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-primary-900 text-lg">{item.course_name}</p>
                    <Badge status={item.mode} />
                  </div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">{item.dept_name}</p>
                </div>

                <div className="hidden md:block text-right">
                  <div className="flex items-center justify-end gap-2 text-primary-900 font-bold">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{item.timing}</span>
                  </div>
                  <p className="text-sm text-muted mt-1">{item.platform || item.college_name || '—'}</p>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-100 pl-6 ml-2">
                  <button 
                    onClick={() => setEditModal({ open: true, item })}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all duration-300"
                    title="Edit Schedule"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Collapsible/Extra Info */}
              {(item.note || item.days) && (
                <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.days && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {item.days.split(',').map(d => (
                          <span key={d} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                            {d.trim().slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.note && (
                    <div className="flex items-start gap-2 text-xs text-muted">
                      <AlertCircle className="w-3.5 h-3.5 text-accent mt-0.5" />
                      <p className="italic">"{item.note}"</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-3 flex items-center justify-between text-[10px] text-muted font-bold uppercase tracking-widest">
                <span>Last Updated: {new Date(item.updated_at).toLocaleString()}</span>
                <span>By: {item.updated_by_role}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal.open && (
        <EditScheduleModal 
          open={editModal.open} 
          onClose={() => setEditModal({ open: false, item: null })}
          schedule={editModal.item}
        />
      )}
    </div>
  );
}

