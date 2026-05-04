'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const fetchEnrolled = () => api.get('/student/courses/enrolled').then((r) => r.data.data);

export default function EnrolledCoursesPage() {
  const qc = useQueryClient();
  const [dropModal, setDropModal] = useState({ open: false, enrolment: null });
  const { data: enrolments = [], isLoading } = useQuery({ queryKey: ['student-enrolled'], queryFn: fetchEnrolled });

  const dropMut = useMutation({
    mutationFn: (id) => api.delete(`/student/enrolments/${id}`),
    onSuccess: () => {
      toast.success('Course dropped');
      qc.invalidateQueries({ queryKey: ['student-enrolled'] });
      qc.invalidateQueries({ queryKey: ['student-available'] });
      setDropModal({ open: false });
    },
    onError: () => toast.error('Failed to drop course'),
  });

  if (isLoading) return (
    <div className="pt-6">
      <div className="skeleton h-8 w-48 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton h-24" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader title="Enrolled Courses" subtitle={`${enrolments.length} enrolments`} />

      {enrolments.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          <p className="text-3xl mb-3">📖</p>
          <p className="font-medium text-primary">No enrolments yet</p>
          <p className="text-sm mt-1">Browse available courses and register.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrolments.map((e) => (
            <div key={e.enrolment_id} className="card flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-primary">{e.course?.course_name}</h3>
                  <Badge status={e.course?.mode} />
                  <Badge status={e.status} />
                </div>
                <p className="text-sm text-muted">{e.course?.department?.dept_name} · {e.course?.timing}</p>
                {e.course?.courseFaculty?.length > 0 && (
                  <p className="text-xs text-muted mt-0.5">
                    Faculty: {e.course.courseFaculty.map((cf) => `${cf.faculty.first_name} ${cf.faculty.last_name}`).join(', ')}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted">{new Date(e.enrolled_at).toLocaleDateString('en-IN')}</p>
              <button
                onClick={() => setDropModal({ open: true, enrolment: e })}
                className="btn-ghost btn-icon text-danger"
                title="Drop course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={dropModal.open} onClose={() => setDropModal({ open: false })} title="Drop Course"
        footer={
          <>
            <button onClick={() => setDropModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => dropMut.mutate(dropModal.enrolment?.enrolment_id)} disabled={dropMut.isPending} className="btn-danger">
              {dropMut.isPending ? 'Dropping...' : 'Drop Course'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Drop <strong className="text-primary">{dropModal.enrolment?.course?.course_name}</strong>? You can re-enrol later.
        </p>
      </Modal>
    </div>
  );
}
