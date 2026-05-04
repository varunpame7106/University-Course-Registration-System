'use client';
import { useState, useEffect } from 'react';
import { 
  FileText, ArrowLeft, Info, CheckCircle2, 
  BarChart3, Scale, GraduationCap, Award 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

export default function GradingRubric() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrading = async () => {
      try {
        const res = await api.get('/resources/grading');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch grading:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrading();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  const components = data?.components || [];
  const gradeScale = data?.scales || [];

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
              Grading Rubric
            </h1>
            <p className="text-muted font-medium text-sm">Official assessment components and grade scale</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assessment Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card border-none shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-primary-900 leading-tight">Assessment Breakdown</h2>
                <p className="text-xs text-muted font-medium">Weightage distribution for courses</p>
              </div>
            </div>

            <div className="space-y-6">
              {components.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-primary-800">{item.component}</span>
                    <span className="text-sm font-bold text-blue-600">{item.marks} Marks</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.marks}%`, transitionDelay: `${idx * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 rounded-2xl bg-blue-600 text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Marks</p>
                  <p className="text-2xl font-display font-bold leading-tight">100 Percent</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium opacity-80">Final Grade</p>
                <p className="text-lg font-bold">Sum of all parts</p>
              </div>
            </div>
          </div>

          <div className="card border-none shadow-xl shadow-slate-200/50 p-6 sm:p-8 bg-slate-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold">Important Notes</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Students must maintain minimum 75% attendance to qualify for End Sem exams.",
                    "Internal marks are non-negotiable and based on consistent performance.",
                    "Mid Sem exams are mandatory; absence requires official medical proof.",
                    "Practical evaluations happen throughout the semester during lab sessions."
                  ].map((note, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>

        {/* Right Column: Grade Scale */}
        <div className="space-y-8">
           <div className="card border-none shadow-xl shadow-slate-200/50 p-6 sm:p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-primary-900 leading-tight">Grade Scale</h2>
                  <p className="text-xs text-muted font-medium">10 Point CGPA System</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 pb-3 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Grade</span>
                  <span className="text-center">Range %</span>
                  <span className="text-right">GPA</span>
                </div>
                {gradeScale.map((g) => (
                  <div key={g.id} className="grid grid-cols-3 py-3 border-b border-slate-50 last:border-0 items-center group">
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                      g.gpa >= 9 ? "bg-green-50 text-green-600 border border-green-100" :
                      g.gpa >= 7 ? "bg-blue-50 text-blue-600 border border-blue-100" :
                      g.gpa >= 5 ? "bg-orange-50 text-orange-600 border border-orange-100" :
                      "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {g.grade}
                    </span>
                    <span className="text-sm font-bold text-slate-600 text-center">{g.minPercent} - {g.maxPercent}</span>
                    <span className="text-sm font-bold text-primary-900 text-right">{g.gpa.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formula</p>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-medium">
                  SGPA = Σ(Credits × Grade Points) / Σ(Credits)
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
