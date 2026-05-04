'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';

const fetchStudents = (id) => api.get(`/faculty/courses/${id}/students`).then((r) => r.data.data);

export default function CourseDetailPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const { data: enrolments = [], isLoading } = useQuery({ queryKey: ['faculty-course-students', id], queryFn: () => fetchStudents(id) });

  const filtered = enrolments.filter((e) => {
    const s = e.student;
    const q = search.toLowerCase();
    return !q || s?.first_name?.toLowerCase().includes(q) || s?.last_name?.toLowerCase().includes(q) || s?.user_id?.toLowerCase().includes(q);
  });

  const columns = [
    { key: 'user_id', label: 'PRN No', render: (_, r) => <span className="font-mono text-sm">#{r.student?.user_id}</span> },
    { 
      key: 'name', 
      label: 'Full Name', 
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
            {r.student?.first_name[0]}{r.student?.last_name[0]}
          </div>
          <span className="font-bold text-primary-900">{r.student?.first_name} {r.student?.last_name}</span>
        </div>
      )
    },
    { key: 'year', label: 'Year Enrolled', render: (_, r) => <span className="font-medium text-slate-600">{r.student?.year_enrolled}</span> },
    { key: 'status', label: 'Enrolment Status' },
  ];

  return (
    <div className="pt-6 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/faculty/courses" className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-900 tracking-tight">Course Students</h1>
          <p className="text-sm text-muted">Reviewing all enrolled participants for this session</p>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="Search by name or PRN..."
          detailTitle="Student Academic Profile"
        />
      </div>
    </div>
  );
}
