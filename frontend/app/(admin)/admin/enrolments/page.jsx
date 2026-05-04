'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, Search, Filter, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';

const fetchEnrolments = ({ page, status }) =>
  api.get('/admin/enrolments', { params: { page, limit: 10, status } }).then((r) => r.data);

export default function EnrolmentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enrolments', page, status],
    queryFn: () => fetchEnrolments({ page, status }),
  });

  const approveMut = useMutation({
    mutationFn: (id) => api.put(`/admin/enrolments/${id}/approve`),
    onSuccess: () => { toast.success('Enrolment approved'); qc.invalidateQueries({ queryKey: ['admin-enrolments'] }); },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMut = useMutation({
    mutationFn: (id) => api.put(`/admin/enrolments/${id}/reject`),
    onSuccess: () => { toast.success('Enrolment rejected'); qc.invalidateQueries({ queryKey: ['admin-enrolments'] }); },
    onError: () => toast.error('Failed to reject'),
  });

  const columns = [
    { 
      key: 'student', 
      label: 'Student', 
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">
            {r.student?.first_name[0]}{r.student?.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-primary-900">{r.student?.first_name} {r.student?.last_name}</span>
            <span className="text-[10px] text-muted font-mono">{r.student?.user_id}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'course', 
      label: 'Applied Course', 
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-800">{r.course?.course_name}</span>
          <span className="text-[10px] text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(r.enrolled_at).toLocaleDateString()}</span>
        </div>
      )
    },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    {
      key: 'actions', label: 'Processing',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' ? (
            <>
              <button 
                onClick={() => approveMut.mutate(row.enrolment_id)} 
                disabled={approveMut.isPending}
                className="btn-primary !py-1.5 !px-3 text-xs bg-success hover:bg-green-600 shadow-success/10 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
              <button 
                onClick={() => rejectMut.mutate(row.enrolment_id)} 
                disabled={rejectMut.isPending}
                className="btn-secondary !py-1.5 !px-3 text-xs text-danger hover:bg-danger-soft border-danger/20 flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          ) : (
            <span className="text-xs text-muted font-medium italic">Already processed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-inner">
      <PageHeader 
        title="Enrolment Queue" 
        subtitle={`Reviewing ${data?.pagination?.total ?? 0} registration applications`}
      />

      <div className="flex items-center gap-3 mb-6 bg-white p-2 rounded-2xl border border-border shadow-sm w-fit">
        <button 
          onClick={() => setStatus('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${status === '' ? 'bg-primary-900 text-white shadow-lg' : 'text-muted hover:text-primary-900'}`}
        >
          All Applications
        </button>
        <button 
          onClick={() => setStatus('Pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${status === 'Pending' ? 'bg-warning text-white shadow-lg shadow-warning/20' : 'text-muted hover:text-primary-900'}`}
        >
          Pending Only
        </button>
        <button 
          onClick={() => setStatus('Approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${status === 'Approved' ? 'bg-success text-white shadow-lg shadow-success/20' : 'text-muted hover:text-primary-900'}`}
        >
          Approved
        </button>
      </div>

      <div className="card">
        <DataTable 
          columns={columns} 
          data={data?.data || []} 
          loading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage} 
          searchPlaceholder="Filter by student name..."
        />
      </div>
    </div>
  );
}
