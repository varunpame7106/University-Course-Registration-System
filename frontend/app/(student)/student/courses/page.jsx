'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookPlus } from 'lucide-react';
import api from '@/lib/axios';
import Badge from '@/components/shared/Badge';
import PageHeader from '@/components/shared/PageHeader';

const fetchAvailable = () => api.get('/student/courses/available').then((r) => r.data.data);

export default function AvailableCoursesPage() {
  const qc = useQueryClient();
  const { data: courses = [], isLoading } = useQuery({ queryKey: ['student-available'], queryFn: fetchAvailable });

  const enrolMut = useMutation({
    mutationFn: (courseId) => api.post(`/student/courses/${courseId}/enrol`),
    onSuccess: () => {
      toast.success('Registered! Awaiting approval.');
      qc.invalidateQueries({ queryKey: ['student-available'] });
      qc.invalidateQueries({ queryKey: ['student-enrolled'] });
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to register'),
  });

  if (isLoading) return (
    <div className="pt-6">
      <div className="skeleton h-8 w-48 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card skeleton h-52" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader title="Available Courses" subtitle={`${courses.length} courses available to register`} />

      {courses.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          <p className="text-3xl mb-3">🎓</p>
          <p className="font-medium text-primary">No more courses available</p>
          <p className="text-sm mt-1">You have registered for all available courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.course_id} className="card flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-primary leading-snug flex-1">{c.course_name}</h3>
                <Badge status={c.mode} />
              </div>
              <p className="text-xs text-muted mb-3">{c.department?.dept_name}</p>
              <div className="space-y-1 text-sm text-muted flex-1">
                <p>⏱ {c.duration}</p>
                <p>🕐 {c.timing}</p>
                {c.mode === 'Online' && c.platform && <p>💻 {c.platform}</p>}
                {c.mode === 'Offline' && c.college_name && <p>🏫 {c.college_name}</p>}
                {c.courseFaculty?.length > 0 && (
                  <p>👤 {c.courseFaculty.map((cf) => `${cf.faculty.first_name} ${cf.faculty.last_name}`).join(', ')}</p>
                )}
              </div>
              <button
                onClick={() => enrolMut.mutate(c.course_id)}
                disabled={enrolMut.isPending}
                className="btn-primary w-full justify-center mt-4"
                id={`enrol-${c.course_id}`}
              >
                <BookPlus className="w-4 h-4" />
                Register
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
