import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: ({ user, token, refreshToken, role }) =>
        set({ user, token, refreshToken, role }),

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, token: null, refreshToken: null, role: null });
      },

      checkAuth: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data, role: data.data.role });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'ucrs-auth',
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        role: state.role,
      }),
    }
  )
);
