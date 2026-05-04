'use client';
import { useState, useEffect } from 'react';
import { 
  Search, Clock, ArrowLeft, AlertCircle, FileText,
  CalendarDays, Monitor
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';

export default function ExaminationSchedule() {
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const res = await api.get('/resources/exams', {
          params: { search, semester: semesterFilter }
        });
        setExams(res.data.data);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchExams, 300);
    return () => clearTimeout(timer);
  }, [search, semesterFilter]);

  const filtered = exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  const upcomingExams = filtered.filter(e => e.status === 'Upcoming');
  const completedExams = filtered.filter(e => e.status === 'Completed');

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <Link href="/student/dashboard" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 leading-none mb-1.5 tracking-tight">
              Examination Schedule
            </h1>
            <p className="text-muted font-medium text-sm">Upcoming and past semester examinations</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-none shadow-xl shadow-slate-200/50 mb-8 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search by subject name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-11 h-12 shadow-none border-slate-100 focus:border-blue-200 bg-slate-50/50"
            />
          </div>
          <select 
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="form-select h-12 md:w-48 shadow-none border-slate-100 bg-slate-50/50"
          >
            <option value="All">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Upcoming Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-display font-bold text-primary-900">Upcoming Exams</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {upcomingExams.length === 0 ? (
                <div className="card border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-center py-12">
                  <p className="text-slate-400 font-medium">No upcoming exams found</p>
                </div>
              ) : (
                upcomingExams.map((exam) => (
                  <div key={exam.id} className="card group hover:shadow-2xl hover:shadow-blue-500/10 border-slate-100/50 transition-all duration-500 p-0 overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-48 bg-blue-600 text-white p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">
                        {new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                      <p className="text-4xl font-display font-bold tracking-tighter">
                        {new Date(exam.examDate).getDate()}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest mt-1">
                        {new Date(exam.examDate).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase tracking-widest">
                            {exam.subjectCode}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200 uppercase tracking-widest">
                            {exam.semester}
                          </span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-primary-900 group-hover:text-blue-600 transition-colors">
                          {exam.subjectName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 md:flex md:items-center gap-6 md:gap-10">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Time
                          </p>
                          <p className="text-sm font-bold text-primary-800">{exam.startTime}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <Monitor className="w-3 h-3" /> Hall / Mode
                          </p>
                          <p className="text-sm font-bold text-primary-800">{exam.hall}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Duration
                          </p>
                          <p className="text-sm font-bold text-primary-800">{exam.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-display font-bold text-primary-900">Completed Exams</h2>
            </div>

            <div className="table-wrapper border-none shadow-xl shadow-slate-200/50">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Hall</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {completedExams.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-muted">No completed exams found</td></tr>
                  ) : (
                    completedExams.map((exam) => (
                      <tr key={exam.id}>
                        <td>
                          <p className="font-bold text-primary-900">{exam.subjectName}</p>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{exam.subjectCode}</p>
                        </td>
                        <td className="font-medium text-slate-600">
                          {new Date(exam.examDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </td>
                        <td>
                          <span className="text-xs font-bold px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                            {exam.hall}
                          </span>
                        </td>
                        <td>
                          <Badge variant="success" className="bg-green-50 text-green-600 border-green-100">Evaluated</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
