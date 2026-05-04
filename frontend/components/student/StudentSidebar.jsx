'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, BookMarked, Calendar, CalendarDays, LogOut, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const links = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'Available Courses', icon: BookOpen },
  { href: '/student/courses/enrolled', label: 'Enrolled Courses', icon: BookMarked },
  { href: '/student/timetable', label: 'Timetable', icon: Calendar },
  { href: '/student/resources/holidays', label: 'Holidays', icon: CalendarDays },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <aside className="sidebar group/sidebar">
      <div className="flex items-center gap-4 px-4 py-8 border-b border-white/5 whitespace-nowrap overflow-hidden">
        <div className="w-12 h-12 flex-shrink-0 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group cursor-pointer transition-transform hover:scale-105">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="flex flex-col opacity-0 w-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:translate-x-0 transition-all duration-300 ease-out">
          <p className="font-display font-bold text-base text-white tracking-tight leading-tight">Student Portal</p>
          <p className="text-xs text-primary-300 font-medium mt-1 truncate max-w-[120px]">{user?.name || 'Student'}</p>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={pathname === href || pathname.startsWith(href + '/') ? 'sidebar-link-active group/item' : 'sidebar-link group/item'}
            style={pathname === href || pathname.startsWith(href + '/') ? { color: '#2563EB', backgroundColor: 'rgb(37 99 235 / 0.08)' } : {}}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="opacity-0 w-0 overflow-hidden -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:translate-x-0 transition-all duration-300 ease-out whitespace-nowrap">
              {label}
            </span>
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold tracking-wider uppercase rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible group-hover/sidebar:hidden group-hover/sidebar:opacity-0 transition-all z-50 whitespace-nowrap shadow-xl">
              {label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout} className="sidebar-link w-full text-danger hover:bg-red-50 hover:text-danger group/item overflow-hidden">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="opacity-0 w-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:translate-x-0 transition-all duration-300 ease-out whitespace-nowrap">
            Logout
          </span>
          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible group-hover/sidebar:hidden group-hover/sidebar:opacity-0 transition-all z-50 whitespace-nowrap shadow-xl">
            Logout
          </div>
        </button>
      </div>
    </aside>
  );
}
