'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import StudentSidebar from '@/components/student/StudentSidebar';

export default function StudentLayout({ children }) {
  const router = useRouter();
  const { token, role, _hasHydrated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!_hasHydrated) {
        useAuthStore.getState().setHasHydrated(true);
      }
    }, 1000);

    if (_hasHydrated) {
      if (!token) {
        router.replace('/login');
      } else if (role !== 'student') {
        router.replace('/login');
      } else {
        useAuthStore.getState().checkAuth();
      }
    }
    return () => clearTimeout(timer);
  }, [token, role, router, _hasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || role !== 'student') return null;

  return (
    <div className="layout-wrapper">
      <StudentSidebar />
      <main className="page-content">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
