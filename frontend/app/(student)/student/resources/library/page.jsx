'use client';
import { useState, useEffect } from 'react';
import { 
  Library, Search, Download, Eye, BookOpen, 
  FileText, ArrowLeft, Filter, Bookmark, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const categories = ['All', 'Engineering', 'Computer Science', 'Civil', 'Mechanical', 'Electronics', 'Management'];

export default function DigitalLibrary() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const res = await api.get('/resources/library', {
          params: { search, category: activeTab, status: 'Active' }
        });
        setResources(res.data.data);
      } catch (error) {
        console.error('Failed to fetch library:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResources, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

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
              Digital Library
            </h1>
            <p className="text-muted font-medium text-sm">Access books, notes and study materials</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card border-none shadow-xl shadow-slate-200/50 mb-8 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search by book name, subject or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-11 h-12 shadow-none border-slate-100 focus:border-blue-200 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                  activeTab === cat 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card h-80 border-none shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-primary-900">No resources found</h3>
          <p className="text-sm text-muted max-w-xs mx-auto mt-1">Try adjusting your search or filters to find what you're looking for</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {resources.map((r) => (
            <div key={r.id} className="card group hover:shadow-2xl hover:shadow-blue-500/10 border-slate-100/50 transition-all duration-500 hover:-translate-y-1.5 p-5 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                  {r.category.substring(0, 3).toUpperCase()}
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="font-bold text-primary-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{r.title}</h3>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-3.5 h-3.5" /> {r.subject}
                  </p>
                  <p className="text-xs text-muted flex items-center gap-1.5 font-medium">
                    <GraduationCap className="w-3.5 h-3.5" /> {r.author}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-auto">
                <a 
                  href={r.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 btn-secondary h-10 gap-2 text-xs rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
                <a 
                  href={r.fileUrl} 
                  download
                  className="flex-1 btn-primary h-10 gap-2 text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center"
                >
                  <Download className="w-3.5 h-3.5" /> Get
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      {!loading && resources.length > 0 && (
        <div className="mt-12 flex items-center justify-center">
          <p className="text-xs font-bold text-slate-400 mx-2 uppercase tracking-widest">Showing {resources.length} resources</p>
        </div>
      )}
    </div>
  );
}
