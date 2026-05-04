'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, BookOpen,
  Building2, ClipboardList, BarChart3, LogOut, GraduationCap,
  Library, CalendarDays, FileText, Calendar
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/faculties', label: 'Faculty', icon: UserCheck },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/enrolments', label: 'Enrolments', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/resources/library', label: 'Library', icon: BookOpen },
  { href: '/admin/resources/exams', label: 'Exams', icon: CalendarDays },
  { href: '/admin/resources/grading', label: 'Grading', icon: FileText },
  { href: '/admin/resources/holidays', label: 'Holidays', icon: Calendar },
];

export default function AdminSidebar() {
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
      {/* Brand */}
      <div className="flex items-center gap-4 px-4 py-8 border-b border-white/5 whitespace-nowrap overflow-hidden">
        <div className="w-12 h-12 flex-shrink-0 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group cursor-pointer transition-transform hover:scale-105">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="flex flex-col opacity-0 w-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:translate-x-0 transition-all duration-300 ease-out">
          <p className="font-display font-bold text-base text-white tracking-tight leading-tight">Admin Portal</p>
          <p className="text-xs text-primary-300 font-medium mt-1 truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href || pathname.startsWith(href + '/')
              ? 'sidebar-link-active group/item'
              : 'sidebar-link group/item'}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="opacity-0 w-0 overflow-hidden -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:translate-x-0 transition-all duration-300 ease-out whitespace-nowrap">
              {label}
            </span>
            {/* Tooltip for collapsed state */}
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold tracking-wider uppercase rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible group-hover/sidebar:hidden group-hover/sidebar:opacity-0 transition-all z-50 whitespace-nowrap shadow-xl">
              {label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout */}
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
