'use client';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter, Users, BookOpen, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import PageHeader from '@/components/shared/PageHeader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const fetchReports = () => api.get('/admin/reports/summary').then((r) => r.data.data);

export default function ReportsPage() {
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: fetchReports });

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F8FAFC' // Matches background color
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`University_Analytics_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return (
    <div className="page-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {[1,2].map((i) => <div key={i} className="card skeleton h-96" />)}
      </div>
      <div className="card skeleton h-64" />
    </div>
  );

  return (
    <div className="page-inner" ref={reportRef}>
      <PageHeader 
        title="Institutional Analytics" 
        subtitle="Comprehensive breakdown of university registration metrics"
        action={
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="btn-primary flex items-center gap-2"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Generating PDF...' : 'Export Analytics'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Department Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900">Enrolments by Department</h3>
                <p className="text-xs text-muted">Distribution across academic units</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {data?.enrolmentsByDept?.map((dept, i) => {
              const max = Math.max(...data.enrolmentsByDept.map(d => d.count), 1);
              const percentage = (dept.count / max) * 100;
              return (
                <div key={dept.dept_name} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-primary-800 group-hover:text-accent transition-colors">{dept.dept_name}</span>
                    <span className="font-mono font-bold text-accent">{dept.count} <span className="text-[10px] text-muted">units</span></span>
                  </div>
                  <div className="h-3 w-full bg-primary-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-1000 group-hover:brightness-110" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900">Top Performing Courses</h3>
                <p className="text-xs text-muted">Based on registration volume</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {data?.topCourses?.map((course, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-primary-50/50 border border-transparent hover:border-border hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-900 font-bold border border-border">
                    {i + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-primary-900 group-hover:text-accent transition-colors">{course.course_name}</span>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Active Curriculum</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-display font-bold text-primary-900">{course.count}</span>
                  <span className="text-[10px] text-success font-bold uppercase tracking-tighter">Approved Enrolments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Distribution Footer */}
      <div className="card bg-slate-900 text-white border-none relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-12 py-10 px-6">
          {data?.modeDistribution?.map((mode) => (
            <div key={mode.mode} className="text-center group">
              <p className="text-primary-300 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">{mode.mode} Delivery</p>
              <h4 className="text-6xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-all duration-500 group-hover:text-accent">
                {mode.count}
              </h4>
              <p className="text-xs text-primary-400 font-medium">Active course modules</p>
            </div>
          ))}
          <div className="hidden md:block w-px h-24 bg-white/10" />
          <div className="text-center group">
            <p className="text-primary-300 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Completion Rate</p>
            <h4 className="text-6xl font-display font-bold text-white mb-2 group-hover:scale-110 transition-all duration-500 group-hover:text-success">
              94%
            </h4>
            <p className="text-xs text-primary-400 font-medium">Institutional average</p>
          </div>
        </div>
      </div>
    </div>
  );
}
