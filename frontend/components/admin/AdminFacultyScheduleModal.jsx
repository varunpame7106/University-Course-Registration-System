'use client';
import { useState } from 'react';
import { Clock, Calendar, AlertCircle, Pencil, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import Modal from '@/components/shared/Modal';
import Badge from '@/components/shared/Badge';
import EditScheduleModal from '@/components/faculty/EditScheduleModal';

const fetchFacultySchedule = (id) => api.get(`/admin/faculties/${id}/schedule`).then((r) => r.data.data);
const fetchAllCourses = () => api.get('/admin/courses', { params: { limit: 100 } }).then((r) => r.data.data);

export default function AdminFacultyScheduleModal({ open, onClose, faculty }) {
  const qc = useQueryClient();
  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [assigning, setAssigning] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const { data: schedule = [], isLoading, refetch } = useQuery({ 
    queryKey: ['faculty-schedule', faculty?.faculty_id], 
    queryFn: () => fetchFacultySchedule(faculty?.faculty_id),
    enabled: !!faculty?.faculty_id && open
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['admin-all-courses'],
    queryFn: fetchAllCourses,
    enabled: assigning
  });

  const assignMut = useMutation({
    mutationFn: (courseId) => api.post(`/admin/faculties/${faculty?.faculty_id}/assign-course`, { course_id: courseId }),
    onSuccess: () => {
      toast.success('Course assigned successfully');
      refetch();
      setAssigning(false);
      setSelectedCourse('');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Assignment failed')
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Schedule: ${faculty?.first_name} ${faculty?.last_name}`}
      footer={<button onClick={onClose} className="btn-secondary">Close</button>}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Assignment Section */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          {!assigning ? (
            <button 
              onClick={() => setAssigning(true)}
              className="w-full py-2 flex items-center justify-center gap-2 text-accent font-bold text-sm hover:bg-white rounded-xl transition-all border border-dashed border-accent/30"
            >
              <Plus className="w-4 h-4" /> Assign New Course
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Select Course to Assign</p>
              <div className="flex gap-2">
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="flex-1 form-select text-sm h-10"
                >
                  <option value="">Select a course...</option>
                  {allCourses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.department.dept_name})</option>
                  ))}
                </select>
                <button 
                  onClick={() => assignMut.mutate(selectedCourse)}
                  disabled={!selectedCourse || assignMut.isPending}
                  className="btn-primary h-10 px-4"
                >
                  {assignMut.isPending ? '...' : 'Assign'}
                </button>
                <button onClick={() => setAssigning(false)} className="btn-ghost h-10 px-2 text-muted">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Currently Assigned Courses</p>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="card skeleton h-20" />)}
            </div>
          ) : schedule.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xl mb-1">🔍</p>
              <p className="text-muted text-sm italic">No courses assigned yet.</p>
            </div>
          ) : (
            schedule.map((item, i) => (
              <div key={i} className="card group hover:border-accent/30 transition-all duration-300 relative bg-white border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-primary-900">{item.course_name}</p>
                      <Badge status={item.mode} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                      <Clock className="w-3 h-3 text-accent" />
                      <span>{item.timing || 'Timing not configured'}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setEditModal({ open: true, item })}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                {(item.note || item.days) && (
                  <div className="mt-3 pt-3 border-t border-slate-50 text-[10px] flex flex-wrap gap-x-4 gap-y-1">
                     {item.days && (
                       <div className="flex items-center gap-1 text-slate-500">
                         <Calendar className="w-3 h-3" />
                         <span>{item.days}</span>
                       </div>
                     )}
                     {item.note && (
                       <div className="flex items-center gap-1 text-accent font-medium">
                         <AlertCircle className="w-3 h-3" />
                         <span className="italic">"{item.note}"</span>
                       </div>
                     )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {editModal.open && (
        <EditScheduleModal 
          open={editModal.open} 
          onClose={() => setEditModal({ open: false, item: null })}
          schedule={editModal.item}
          isAdmin={true}
          facultyId={faculty?.faculty_id}
        />
      )}
    </Modal>
  );
}
