'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Pencil, BookOpen, Clock, 
  MapPin, Phone, GraduationCap, 
  Calendar, CheckCircle2, AlertCircle,
  User, LayoutDashboard, Library, FileText, CalendarDays, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/axios';
import Modal from '@/components/shared/Modal';
import StatCard from '@/components/shared/StatCard';
import { validatePhone, validatePincode, nameRegex } from '@/lib/validators';

const schema = z.object({
  phone_no: z.string().refine(validatePhone, 'Phone must be exactly 10 digits'),
  city: z.string().min(1, 'Required').regex(nameRegex, 'Only alphabets allowed'),
  state: z.string().min(1, 'Required').regex(nameRegex, 'Only alphabets allowed'),
  pincode: z.string().refine(validatePincode, 'Pincode must be exactly 6 digits'),
  gender: z.enum(['Male', 'Female', 'Other', 'PreferNotToSay']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  dob: z.string().min(1, 'Required'),
  guardian_name: z.string().min(1, 'Required').regex(nameRegex, 'Only alphabets allowed'),
  alt_phone: z.string().refine((val) => !val || validatePhone(val), 'Alt phone must be 10 digits').optional().or(z.literal('')),
  emergency_contact: z.string().refine(validatePhone, 'Emergency contact must be 10 digits'),
  blood_group: z.string().min(1, 'Required'),
  profile_image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const fetchProfile = () => api.get('/student/profile').then((r) => r.data.data);
const fetchEnrolled = () => api.get('/student/courses/enrolled').then((r) => r.data.data);

export default function StudentDashboard() {
  const qc = useQueryClient();
  const [editModal, setEditModal] = useState(false);
  const { data: profile, isLoading } = useQuery({ queryKey: ['student-profile'], queryFn: fetchProfile });
  const { data: enrolled = [] } = useQuery({ queryKey: ['student-enrolled'], queryFn: fetchEnrolled });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const pendingCount = enrolled.filter((e) => e.status === 'Pending').length;
  const approvedCount = enrolled.filter((e) => e.status === 'Approved').length;

  const openEdit = () => {
    reset({
      phone_no: profile?.phone_no, 
      city: profile?.city,
      state: profile?.state, 
      pincode: profile?.pincode,
      gender: profile?.gender,
      address: profile?.address || '',
      dob: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
      guardian_name: profile?.guardian_name || '',
      alt_phone: profile?.alt_phone || '',
      emergency_contact: profile?.emergency_contact || '',
      blood_group: profile?.blood_group || '',
      profile_image_url: profile?.profile_image_url || '',
    });
    setEditModal(true);
  };

  const handleInputSanitize = (e, pattern, field) => {
    const val = e.target.value;
    const sanitized = val.replace(pattern, '');
    if (val !== sanitized) {
      e.target.value = sanitized;
      setValue(field, sanitized, { shouldValidate: true });
    }
  };

  const updateMut = useMutation({
    mutationFn: (d) => api.put('/student/profile', d),
    onSuccess: () => { 
      toast.success('Profile updated successfully'); 
      qc.invalidateQueries({ queryKey: ['student-profile'] }); 
      setEditModal(false); 
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) return (
    <div className="page-inner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1,2,3].map((i) => <div key={i} className="card skeleton h-32" />)}
      </div>
      <div className="card skeleton h-96" />
    </div>
  );

  return (
    <div className="page-inner pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl overflow-hidden">
              {profile?.profile_image_url ? (
                <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{profile?.first_name?.[0] || 'S'}</span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 leading-none mb-1.5 tracking-tight">
              Hello, {profile?.first_name || 'Student'} 👋
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest text-[10px]">
                <LayoutDashboard className="w-3 h-3" /> {profile?.department?.dept_name}
              </div>
              <span className="text-primary-200">|</span>
              <span className="text-muted font-bold text-[11px] uppercase tracking-wider">Class of {profile?.year_enrolled + 4}</span>
            </div>
          </div>
        </div>
        <button onClick={openEdit} className="btn-primary flex items-center gap-2.5 px-6 py-2.5 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-95">
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Enrolled Courses" value={enrolled.length} icon={BookOpen} color="blue" />
        <StatCard label="Approved Courses" value={approvedCount} icon={CheckCircle2} color="green" />
        <StatCard label="Pending Requests" value={pendingCount} icon={Clock} color="purple" trend="In review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card relative overflow-hidden group border-none shadow-xl shadow-slate-200/50">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-xl font-display font-bold text-primary-900">Personal Information</h2>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                {profile?.status || 'Active'} Student
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
              {[
                { label: 'Full Name', value: `${profile?.first_name} ${profile?.last_name}`, icon: User },
                { label: 'PRN Number', value: profile?.user_id, icon: AlertCircle },
                { label: 'Date of Birth', value: profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—', icon: Calendar },
                { label: 'Gender', value: profile?.gender, icon: User },
                { label: 'Phone Number', value: profile?.phone_no, icon: Phone },
                { label: 'Official Department', value: profile?.department?.dept_name, icon: GraduationCap },
                { label: 'Guardian Name', value: profile?.guardian_name, icon: User },
                { label: 'Emergency Contact', value: profile?.emergency_contact, icon: Phone },
                { label: 'Alternate Phone', value: profile?.alt_phone, icon: Phone },
                { label: 'Blood Group', value: profile?.blood_group, icon: AlertCircle },
              ].map((item) => (
                <div key={item.label} className="group/item flex items-start gap-4 p-3 -m-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 group-hover/item:border-blue-100 transition-all shadow-sm">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-primary-900 group-hover/item:text-blue-700 transition-colors">{item.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-6 bg-slate-200 rounded-full" />
              <h2 className="text-xl font-display font-bold text-primary-900">Residential Address</h2>
            </div>
            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Full Address</p>
              <p className="font-bold text-primary-900 leading-relaxed">{profile?.address || '—'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'City', value: profile?.city, icon: MapPin },
                { label: 'State', value: profile?.state, icon: MapPin },
                { label: 'Pincode', value: profile?.pincode, icon: MapPin },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">{item.label}</p>
                  <p className="font-bold text-primary-900">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
            <h4 className="font-bold mb-6 flex items-center gap-2 relative z-10">
              <Clock className="w-5 h-5 text-blue-200" /> Current Academic Cycle
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-wider font-bold">Upcoming Semester</p>
                <p className="text-xl font-display font-bold">Fall 2026 Session</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <p className="text-blue-100 text-[10px] mb-1 uppercase tracking-wider font-bold">Registration Deadline</p>
                <p className="text-xl font-display font-bold flex items-center gap-2">
                  15 May, 2026 <AlertCircle className="w-4 h-4 text-orange-300" />
                </p>
              </div>
            </div>
          </div>

          <div className="card border-none shadow-xl shadow-slate-200/50">
            <h4 className="font-bold mb-6 text-primary-900 flex items-center gap-2">
              <Library className="w-5 h-5 text-blue-600" /> Academic Resources
            </h4>
            <div className="space-y-2.5">
              {[
                { label: 'Digital Library', icon: Library, href: '/student/resources/library' },
                { label: 'Examination Schedule', icon: CalendarDays, href: '/student/resources/exams' },
                { label: 'Grading Rubric', icon: FileText, href: '/student/resources/grading' },
                { label: 'Holiday Calendar', icon: Calendar, href: '/student/resources/holidays' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-blue-50 text-sm font-bold text-primary-700 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    {item.label}
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Update Personal Records"
        footer={
          <>
            <button onClick={() => setEditModal(false)} className="btn-secondary">Discard Changes</button>
            <button onClick={handleSubmit((d) => updateMut.mutate(d))} disabled={updateMut.isPending} className="btn-primary shadow-lg shadow-blue-500/20">
              {updateMut.isPending ? 'Syncing...' : 'Update Records'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Contact Info */}
          <div>
            <label className="form-label">Phone Number</label>
            <input 
              {...register('phone_no')} 
              placeholder="10-digit mobile number"
              className={errors.phone_no ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^0-9]/g, 'phone_no')}
            />
            {errors.phone_no && <p className="form-error">{errors.phone_no.message}</p>}
          </div>
          <div>
            <label className="form-label">Alternate Phone (Optional)</label>
            <input 
              {...register('alt_phone')} 
              placeholder="10-digit mobile number"
              className={errors.alt_phone ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^0-9]/g, 'alt_phone')}
            />
            {errors.alt_phone && <p className="form-error">{errors.alt_phone.message}</p>}
          </div>

          {/* Personal Info */}
          <div>
            <label className="form-label">Gender</label>
            <select {...register('gender')} className={errors.gender ? "form-input-error" : "form-input"}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="PreferNotToSay">Prefer not to say</option>
            </select>
            {errors.gender && <p className="form-error">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="form-label">Date of Birth</label>
            <input type="date" {...register('dob')} className={errors.dob ? "form-input-error" : "form-input"} />
            {errors.dob && <p className="form-error">{errors.dob.message}</p>}
          </div>

          {/* Family & Health */}
          <div>
            <label className="form-label">Guardian Name</label>
            <input 
              {...register('guardian_name')} 
              className={errors.guardian_name ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^A-Za-z ]/g, 'guardian_name')}
            />
            {errors.guardian_name && <p className="form-error">{errors.guardian_name.message}</p>}
          </div>
          <div>
            <label className="form-label">Blood Group</label>
            <select {...register('blood_group')} className={errors.blood_group ? "form-input-error" : "form-input"}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            {errors.blood_group && <p className="form-error">{errors.blood_group.message}</p>}
          </div>

          {/* Emergency */}
          <div>
            <label className="form-label">Emergency Contact</label>
            <input 
              {...register('emergency_contact')} 
              placeholder="10-digit mobile number"
              className={errors.emergency_contact ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^0-9]/g, 'emergency_contact')}
            />
            {errors.emergency_contact && <p className="form-error">{errors.emergency_contact.message}</p>}
          </div>
          <div>
            <label className="form-label">Profile Image URL</label>
            <input {...register('profile_image_url')} placeholder="https://..." className={errors.profile_image_url ? "form-input-error" : "form-input"} />
            {errors.profile_image_url && <p className="form-error">{errors.profile_image_url.message}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="form-label">Full Address</label>
            <textarea {...register('address')} rows="2" className={errors.address ? "form-input-error" : "form-input"} placeholder="House No, Street, Landmark..."></textarea>
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          <div>
            <label className="form-label">City</label>
            <input 
              {...register('city')} 
              className={errors.city ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^A-Za-z ]/g, 'city')}
            />
            {errors.city && <p className="form-error">{errors.city.message}</p>}
          </div>
          <div>
            <label className="form-label">State</label>
            <input 
              {...register('state')} 
              className={errors.state ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^A-Za-z ]/g, 'state')}
            />
            {errors.state && <p className="form-error">{errors.state.message}</p>}
          </div>
          <div>
            <label className="form-label">Pincode</label>
            <input 
              {...register('pincode')} 
              className={errors.pincode ? "form-input-error" : "form-input"} 
              onChange={(e) => handleInputSanitize(e, /[^0-9]/g, 'pincode')}
            />
            {errors.pincode && <p className="form-error">{errors.pincode.message}</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
