'use client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, BookOpen, Clock, 
  Calendar, CheckCircle2, AlertCircle, 
  GraduationCap, ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';

const fetchProfile = () => api.get('/faculty/profile').then((r) => r.data.data);
const fetchCourses = () => api.get('/faculty/courses').then((r) => r.data.data);

export default function FacultyDashboard() {
  // ALL hooks must be called before any conditional returns (React Rules of Hooks)
  const { data: profile, isLoading: profileLoading } = useQuery({ queryKey: ['faculty-profile'], queryFn: fetchProfile });
  const { data: courses = [], isLoading: coursesLoading } = useQuery({ queryKey: ['faculty-courses'], queryFn: fetchCourses });
  const { data: schedule = [] } = useQuery({ queryKey: ['faculty-schedule'], queryFn: () => api.get('/faculty/schedule').then(r => r.data.data) });

  // Derived values (safe after all hooks)
  const totalStudents = courses.reduce((acc, c) => acc + (c._count?.enrolments || 0), 0);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = schedule.filter(s => s.days && s.days.includes(today));

  if (profileLoading || coursesLoading) return (
    <div className="page-inner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1,2,3].map((i) => <div key={i} className="card skeleton h-32" />)}
      </div>
      <div className="card skeleton h-96" />
    </div>
  );

  return (
    <div className="page-inner">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-600/20">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 leading-none mb-1">
              Welcome back, Prof. {profile?.last_name || 'Faculty'}
            </h1>
            <p className="text-muted font-medium flex items-center gap-2">
              <span className="text-teal-600">{profile?.designation}</span> 
              <span className="text-primary-200">|</span>
              {profile?.department?.dept_name}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/faculty/schedule" className="btn-secondary">View Schedule</Link>
          <Link href="/faculty/courses" className="btn-primary bg-teal-600 hover:bg-teal-700 shadow-teal-600/20">Manage Courses</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Assigned Courses" value={courses.length} icon={BookOpen} color="teal" />
        <StatCard label="Total Students" value={totalStudents} icon={Users} color="blue" trend="+5 from yesterday" />
        <StatCard label="Department Rank" value="#4" icon={CheckCircle2} color="purple" trend="Top 10%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-primary-900">Assigned Courses</h2>
            <Link href="/faculty/courses" className="text-sm font-bold text-teal-600 hover:underline flex items-center gap-1">
              All Courses <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <DataTable
            columns={[
              { key: 'course_name', label: 'Course Name', render: (v) => <span className="font-bold text-primary-900">{v}</span> },
              { key: 'mode', label: 'Mode' },
              { key: 'students', label: 'Students', render: (_, r) => (
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-700">{r._count?.enrolments || 0}</span>
                </div>
              )},
              { key: 'timing', label: 'Timing', render: (v) => <span className="text-xs font-mono text-slate-500 font-bold">{v}</span> },
            ]}
            data={courses}
            loading={coursesLoading}
            detailTitle="Course Information"
          />
        </div>

        <div className="space-y-6">
          <div className="card bg-teal-900 text-white border-none">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-teal-100">
              <Calendar className="w-5 h-5" /> Today's Schedule
            </h4>
            <div className="space-y-4">
              {todayClasses.length === 0 ? (
                <div className="py-8 text-center text-teal-100/40 italic text-sm">
                  No classes scheduled for today.
                </div>
              ) : (
                todayClasses.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                      {idx === 0 ? 'Upcoming Class' : 'Next Class'}
                    </p>
                    <p className="font-bold text-lg">{item.course_name}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-teal-100/50">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.start_time} - {item.end_time}</span>
                      <span className="bg-teal-500/20 px-2 py-0.5 rounded text-teal-200">{item.platform}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h4 className="font-bold mb-4 text-primary-900">Faculty Notices</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1 h-auto bg-teal-500 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-primary-900">Submit Grades</p>
                  <p className="text-xs text-muted">Due by Friday, 24 April</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 h-auto bg-amber-500 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-primary-900">Department Meeting</p>
                  <p className="text-xs text-muted">Starts in 45 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
