'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';

const fetchTimetable = () => api.get('/student/timetable').then((r) => r.data.data);

export default function TimetablePage() {
  const { data: courses = [], isLoading } = useQuery({ queryKey: ['student-timetable'], queryFn: fetchTimetable });

  if (isLoading) return (
    <div className="pt-6">
      <div className="skeleton h-8 w-40 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card skeleton h-24" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader title="My Timetable" subtitle="Approved course schedule" />

      {courses.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          <p className="text-3xl mb-3">📅</p>
          <p className="font-medium text-primary">No approved courses yet</p>
          <p className="text-sm mt-1">Your timetable will appear once enrolments are approved by the admin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c, i) => (
            <div key={c.course_id} className="card flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-btn flex items-center justify-center flex-shrink-0">
                <span className="text-student-accent font-bold text-sm">#{i + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-primary">{c.course_name}</h3>
                  <Badge status={c.mode} />
                </div>
                <p className="text-sm text-muted">{c.department?.dept_name}</p>
                {c.courseFaculty?.length > 0 && (
                  <p className="text-xs text-muted">Faculty: {c.courseFaculty.map((cf) => `${cf.faculty.first_name} ${cf.faculty.last_name}`).join(', ')}</p>
                )}
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-primary">{c.timing}</p>
                <p className="text-muted text-xs">{c.platform || c.college_name || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
