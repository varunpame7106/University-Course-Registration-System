'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, LogIn, UserCircle, ShieldCheck, BookOpen } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { LampContainer } from '@/components/ui/lamp';
import { TypewriterTestimonial } from '@/components/ui/typewriter-testimonial';

const loginSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'faculty', 'student']),
});

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, watch, setValue, clearErrors, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      role: 'student',
      user_id: ''
    }
  });

  // Load remembered credentials on mount to avoid hydration mismatch
  useEffect(() => {
    const savedId = localStorage.getItem('ucrs_remember_id');
    const savedRole = localStorage.getItem('ucrs_remember_role');
    if (savedId) {
      setValue('user_id', savedId);
      setRememberMe(true);
    }
    if (savedRole) {
      setValue('role', savedRole);
    }
  }, [setValue]);

  const selectedRole = watch('role');

  const onSubmit = async (values) => {
    setIsLoading(true);
    // Normalize Student/Faculty IDs to uppercase
    const normalizedValues = {
      ...values,
      user_id: values.role === 'admin' ? values.user_id : values.user_id.toUpperCase()
    };
    
    try {
      const { data } = await api.post('/auth/login', normalizedValues);
      const { accessToken, refreshToken, user } = data.data;
      
      if (rememberMe) {
        localStorage.setItem('ucrs_remember_id', normalizedValues.user_id);
        localStorage.setItem('ucrs_remember_role', normalizedValues.role);
      } else {
        localStorage.removeItem('ucrs_remember_id');
        localStorage.removeItem('ucrs_remember_role');
      }

      setAuth({
        user,
        token: accessToken,
        refreshToken,
        role: user.role
      });
      
      toast.success('Welcome back!');
      
      const rolePath = normalizedValues.role === 'admin' ? '/admin/dashboard' : normalizedValues.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
      router.push(rolePath);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrator', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'faculty', label: 'Faculty', icon: UserCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  // Auto-detect role based on user_id prefix
  const userIdValue = watch('user_id');
  useEffect(() => {
    if (userIdValue?.toUpperCase().startsWith('PRN')) {
      setValue('role', 'student');
      clearErrors('role');
    } else if (userIdValue?.toUpperCase().startsWith('FAC')) {
      setValue('role', 'faculty');
      clearErrors('role');
    }
  }, [userIdValue, setValue, clearErrors]);

  return (
    <LampContainer className="font-sans">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[120px] animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden m-4 animate-in fade-in zoom-in-95 duration-1000 max-h-[95vh]">
        
        {/* Left Side: Branding/Visual */}
        <div className="hidden md:flex md:w-[45%] bg-[#1A1A2E] p-10 lg:p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
          {/* Animated Mesh Gradient Background */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(at_0%_0%,rgba(79,70,229,0.4)_0%,transparent_50%),radial-gradient(at_100%_0%,rgba(20,184,166,0.3)_0%,transparent_50%),radial-gradient(at_50%_100%,rgba(99,102,241,0.2)_0%,transparent_50%)] animate-pulse" />
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 flex items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl transition-transform duration-500 group-hover:rotate-12">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-display font-bold text-white tracking-tight block">UCRS Portal</span>
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">Academic Excellence</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">New Update 2026</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6 tracking-tight">
              Empowering <br /> 
              <span className="relative inline-block mt-2">
                <span className="relative z-10 px-4 py-1.5">Next Generation</span>
                <div className="absolute inset-0 bg-accent/20 rounded-xl skew-x-[-12deg] border border-accent/30 shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
              </span> <br /> 
              <span className="inline-block mt-2">of Learners.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm font-medium">
              A premium, secure environment for university registrations and academic management.
            </p>
          </div>

          {/* Testimonials Strip */}
          <div className="relative z-10">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] mb-3">
              Trusted by our community
            </p>
            <TypewriterTestimonial testimonials={[
              {
                image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
                text: 'UCRS made course registration seamless. I enrolled in all my subjects in under 2 minutes — no queues, no stress!',
                name: 'Arjun Mehta',
                jobtitle: 'B.Tech Student, Sem 5',
              },
              {
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
                text: 'Managing my course load and tracking enrolments has never been easier. The faculty dashboard is a game changer.',
                name: 'Dr. Priya Nair',
                jobtitle: 'Professor, CS Department',
              },
              {
                image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop',
                text: 'Approval workflows are instant. The admin panel gives me full visibility over every department in real time.',
                name: 'Rohit Sharma',
                jobtitle: 'Academic Administrator',
              },
              {
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
                text: 'I love how I can check my timetable, enrolment status, and grades all from one clean interface.',
                name: 'Sneha Kulkarni',
                jobtitle: 'M.Sc Student, Sem 2',
              },
              {
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
                text: 'Creating and assigning courses for my department took seconds. The system is robust and reliable.',
                name: 'Prof. Anil Desai',
                jobtitle: 'HOD, IT Department',
              },
            ]} />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-8 lg:p-14 flex flex-col justify-center bg-white relative">
          <div className="mb-8 relative">
            <h2 className="text-3xl font-display font-bold text-primary-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-muted text-base">Enter your credentials to continue</p>
            <div className="absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-px bg-primary-100 hidden lg:block" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Role Selection */}
            <div>
              <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-3 ml-1">Account Role</p>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setValue('role', role.id);
                      clearErrors();
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                      selectedRole === role.id 
                        ? `border-accent bg-accent/[0.03] shadow-[0_8px_20px_-6px_rgba(79,70,229,0.15)] ring-1 ring-accent/20` 
                        : 'border-primary-50 bg-primary-50/20 hover:border-accent/30 hover:bg-white hover:shadow-xl'
                    }`}
                  >
                    <div className={`transition-all duration-500 ${
                      selectedRole === role.id ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      <role.icon className={`w-6 h-6 mb-2 transition-colors duration-500 ${
                        selectedRole === role.id ? 'text-accent' : 'text-primary-300 group-hover:text-primary-600'
                      }`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                      selectedRole === role.id ? 'text-accent' : 'text-primary-400 group-hover:text-primary-700'
                    }`}>
                      {role.label}
                    </span>
                    {selectedRole === role.id && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                    )}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('role')} />
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="form-label" htmlFor="user_id">
                  {selectedRole === 'student' ? 'Student PRN Number' : selectedRole === 'faculty' ? 'Faculty ID' : 'Administrator Username'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-accent transition-colors">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <input
                    {...register('user_id')}
                    id="user_id"
                    type="text"
                    placeholder={selectedRole === 'student' ? "e.g. PRN2024001" : "Enter your ID"}
                    className={`${errors.user_id ? 'form-input-error' : 'form-input'} pl-12 h-12 text-sm font-medium`}
                  />
                </div>
                {errors.user_id && <p className="form-error">{errors.user_id.message}</p>}
              </div>

              <div className="group">
                <label className="form-label" htmlFor="password">Security Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300 group-focus-within:text-accent transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`${errors.password ? 'form-input-error' : 'form-input'} pl-12 h-12 text-sm font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-300 hover:text-accent transition-all p-1 hover:bg-accent/10 rounded-lg"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only" 
                  />
                  <div className="w-5 h-5 border-2 border-primary-100 rounded-md peer-checked:bg-accent peer-checked:border-accent transition-all" />
                  <div className="absolute text-white scale-0 peer-checked:scale-100 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-500 group-hover:text-primary-900 transition-colors">Stay signed in</span>
              </label>
              <button type="button" className="text-sm font-bold text-accent hover:text-accent-hover transition-colors underline-offset-4 hover:underline">
                Reset password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-[20px] active:scale-[0.98] transition-transform duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-indigo-600 transition-all duration-500 group-hover:scale-110" />
              <div className="relative py-3.5 flex items-center justify-center gap-3 text-white font-bold text-base shadow-xl shadow-accent/25">
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <LogIn className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-50 text-center">
            <p className="text-xs text-primary-400 font-medium">
              Having trouble logging in? <span className="font-bold text-accent hover:text-accent-hover cursor-pointer transition-colors decoration-2 hover:underline">Support Center</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-40 pointer-events-none z-50 mix-blend-difference">
        <div className="h-[1px] w-12 bg-white" />
        <span className="text-white text-[9px] font-black tracking-[0.4em] uppercase whitespace-nowrap">
          University Subject Registration System
        </span>
        <div className="h-[1px] w-12 bg-white" />
      </div>
    </LampContainer>
  );
}
