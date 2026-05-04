'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { token, role, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Safety timeout: if hydration takes more than 1s, check current state anyway
    const timer = setTimeout(() => {
      if (!_hasHydrated) {
        useAuthStore.getState().setHasHydrated(true);
      }
    }, 1000);

    if (_hasHydrated) {
      if (!token) {
        router.replace('/login');
      } else if (role !== 'admin') {
        router.replace('/login');
      } else {
        // Validate session with backend
        useAuthStore.getState().checkAuth();
      }
    }
    return () => clearTimeout(timer);
  }, [token, role, router, _hasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || role !== 'admin') return null;

  return (
    <div className="layout-wrapper">
      <AdminSidebar />
      <main className="page-content">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
