'use client';
import { useState, useEffect } from 'react';
import { 
  Calendar, Search, PartyPopper, ArrowLeft, 
  ChevronRight, CalendarDays, Filter, Star,
  Bell, Clock, Download
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const typeBadge = {
  Public:     'bg-red-50 text-red-600 border-red-100',
  University: 'bg-blue-50 text-blue-600 border-blue-100',
  Vacation:   'bg-purple-50 text-purple-600 border-purple-100',
  Event:      'bg-amber-50 text-amber-600 border-amber-100',
};

export default function HolidayCalendar() {
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState('All');
  const [typeFilter, setTypeFilter]   = useState('All');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const res = await api.get('/resources/holidays', {
          params: { search, status: 'Active' },
          signal: controller.signal,
        });
        
        // Enrich holidays with month names
        const enriched = (res.data.data || []).map(h => ({
          ...h,
          monthName: new Date(h.date).toLocaleDateString('en-US', { month: 'long' })
        }));
        
        setHolidays(enriched);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Failed to fetch holidays:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchHolidays, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search]);

  const filtered = holidays.filter(h => {
    const monthOk = activeMonth === 'All' || h.monthName === activeMonth;
    const typeOk  = typeFilter  === 'All' || h.type === typeFilter;
    return monthOk && typeOk;
  });

  const upcomingHoliday = holidays.find(h => new Date(h.date) >= new Date()) || holidays[0];

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
              Holiday Calendar
            </h1>
            <p className="text-muted font-medium text-sm">University holidays and events for the academic year</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calendar View */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filters */}
            <div className="card border-none shadow-xl shadow-slate-200/50 p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Search holiday..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input pl-11 h-12 shadow-none border-slate-100 focus:border-blue-200 bg-slate-50/50"
                  />
                </div>
                {/* Type filter chips */}
                <div className="flex flex-wrap gap-2">
                  {['All', 'Public', 'University', 'Vacation', 'Event'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all',
                        typeFilter === t
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                  {months.map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMonth(m)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                        activeMonth === m 
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grouped Holidays */}
            <div className="space-y-6">
              {filtered.length === 0 ? (
                <div className="card h-60 border-none shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center">
                   <p className="text-slate-400 font-medium">No holidays found for selected filters</p>
                </div>
              ) : (
                months.filter(m => m !== 'All' && (activeMonth === 'All' || activeMonth === m)).map(month => {
                  const monthHolidays = filtered.filter(h => h.monthName === month);
                  if (monthHolidays.length === 0) return null;

                  return (
                    <div key={month} className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <div className="w-6 h-[1px] bg-slate-200" /> {month}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {monthHolidays.map((h) => (
                          <div key={h.id} className="card group hover:shadow-2xl hover:shadow-blue-500/10 border-slate-100/50 transition-all duration-500 p-5 flex items-start gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 font-display flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                              <span className="text-lg font-bold leading-none">{new Date(h.date).getDate()}</span>
                              <span className="text-[8px] font-bold uppercase tracking-tighter">{month.substring(0, 3)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-primary-900 group-hover:text-blue-600 transition-colors">{h.title}</h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                  typeBadge[h.type] || 'bg-slate-50 text-slate-500 border-slate-100'
                                )}>
                                  {h.type}
                                </span>
                                <span className="text-[10px] text-muted font-medium italic">
                                  {new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </span>
                              </div>
                              {h.description && (
                                <p className="text-xs text-muted mt-1.5 line-clamp-1 font-medium">{h.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Highlight */}
            {upcomingHoliday && (
              <div className="card bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 backdrop-blur-md">
                    <Bell className="w-5 h-5 animate-float" />
                  </div>
                  <h4 className="font-bold tracking-wide">Next Holiday Alert</h4>
                </div>

                <div className="relative z-10">
                  <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-80">Happening Soon</p>
                  <h3 className="text-3xl font-display font-bold leading-tight mb-4">{upcomingHoliday.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold">
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(upcomingHoliday.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> {Math.ceil((new Date(upcomingHoliday.date) - new Date()) / (1000 * 60 * 60 * 24))} Days left
                     </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card border-none shadow-xl shadow-slate-200/50">
              <h4 className="font-bold mb-4 text-primary-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Important Note
              </h4>
              <p className="text-xs text-muted leading-relaxed font-medium">
                Academic holidays are subject to change based on government directives and university administration decisions. Students are advised to check official notifications regularly.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100">
                 <button className="w-full btn-secondary h-11 rounded-xl text-xs gap-2">
                   <Download className="w-4 h-4" /> Download PDF Calendar
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
