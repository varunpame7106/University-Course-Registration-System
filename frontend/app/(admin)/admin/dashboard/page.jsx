'use client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, UserCheck, BookOpen, Building2, 
  TrendingUp, Calendar, ArrowUpRight, Clock 
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';

const fetchStats = () => api.get('/admin/dashboard/stats').then((r) => r.data.data);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });

  if (isLoading) return (
    <div className="page-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1,2,3,4].map((i) => <div key={i} className="card skeleton h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card skeleton h-96" />
        <div className="card skeleton h-96" />
      </div>
    </div>
  );

  const statItems = [
    { label: 'Total Students', value: stats?.students, icon: Users, color: 'indigo', trend: '+12% from last month' },
    { label: 'Faculty Members', value: stats?.faculty, icon: UserCheck, color: 'teal', trend: 'Stable' },
    { label: 'Active Courses', value: stats?.courses, icon: BookOpen, color: 'blue', trend: '+4 new this week' },
    { label: 'Departments', value: stats?.departments, icon: Building2, color: 'purple', trend: 'Global view' },
  ];

  return (
    <div className="page-inner">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-1">Administrative Overview</h1>
          <p className="text-muted flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Download Report</button>
          <Link href="/admin/reports" className="btn-primary">View Analytics</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statItems.map((item) => (
          <div key={item.label} className="card group hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-muted mb-1">{item.label}</p>
                <h3 className="text-3xl font-display font-bold text-primary-900">{item.value || 0}</h3>
                <p className="text-[10px] font-bold text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {item.trend}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm`}>
                <item.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-primary-900">Recent Enrolments</h2>
            <Link href="/admin/enrolments" className="text-sm font-bold text-accent hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <DataTable
            columns={[
              { 
                key: 'student', 
                label: 'Student', 
                render: (_, en) => (
                  <div className="flex flex-col">
                    <span className="font-bold text-primary-900">{en.student?.first_name} {en.student?.last_name}</span>
                    <span className="text-[10px] text-muted font-mono">#{en.student?.user_id}</span>
                  </div>
                )
              },
              { key: 'course', label: 'Course', render: (_, en) => <span className="font-medium text-slate-700">{en.course?.course_name}</span> },
              { key: 'date', label: 'Enrolled Date', render: (_, en) => <span className="text-xs text-slate-500">{new Date(en.enrolled_at).toLocaleDateString()}</span> },
              { key: 'status', label: 'Status' },
            ]}
            data={stats?.recentEnrolments || []}
            loading={isLoading}
            detailTitle="Enrolment Specifics"
          />
        </div>

        {/* Quick Actions / System Status */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-primary-900">System Status</h2>
          <div className="card bg-primary-900 text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-success">All Systems Operational</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Database Connected</h4>
              <p className="text-primary-300 text-sm mb-6 leading-relaxed">
                The MySQL instance is synced and performing at peak capacity. Backup completed 4 hours ago.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-primary-400 mb-1">Server Latency</p>
                  <p className="font-mono font-bold">24ms</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-primary-400 mb-1">Uptime</p>
                  <p className="font-mono font-bold">99.98%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-bold mb-4 text-primary-900">Quick Actions</h4>
            <div className="grid gap-3">
              {[
                { label: 'Add New Student', href: '/admin/students', icon: Plus },
                { label: 'Create Course', href: '/admin/courses', icon: Plus },
                { label: 'Register Faculty', href: '/admin/faculties', icon: Plus },
              ].map((action) => (
                <Link 
                  key={action.label} 
                  href={action.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 border border-transparent hover:border-border transition-all duration-200 group"
                >
                  <span className="text-sm font-medium text-primary-700 group-hover:text-accent">{action.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-200">
                    <Plus className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}
