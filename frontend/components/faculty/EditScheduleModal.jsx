'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Modal from '@/components/shared/Modal';
import { Clock, MapPin, Calendar, FileText } from 'lucide-react';

const schema = z.object({
  days: z.array(z.string()).min(1, 'At least one day is required'),
  start_time: z.string().min(1, 'Required'),
  end_time: z.string().min(1, 'Required'),
  mode: z.enum(['Online', 'Offline']),
  venue: z.string().min(1, 'Venue/Platform is required'),
  note: z.string().optional(),
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function EditScheduleModal({ open, onClose, schedule, isAdmin = false, facultyId = null }) {
  const qc = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      days: schedule?.days ? schedule.days.split(', ') : [],
      start_time: schedule?.start_time || '',
      end_time: schedule?.end_time || '',
      mode: schedule?.mode || 'Online',
      venue: schedule?.platform || schedule?.venue || '',
      note: schedule?.note || '',
    }
  });

  const selectedDays = watch('days');

  const mutation = useMutation({
    mutationFn: (data) => {
      const endpoint = isAdmin 
        ? `/admin/faculties/${facultyId}/courses/${schedule.course_id}/schedule`
        : `/faculty/schedule/${schedule.course_id}`;
      return api.put(endpoint, {
        ...data,
        days: data.days.join(', ')
      });
    },
    onSuccess: () => {
      toast.success('Schedule updated successfully');
      qc.invalidateQueries({ queryKey: isAdmin ? ['admin-faculties'] : ['faculty-schedule'] });
      if (isAdmin && facultyId) {
        qc.invalidateQueries({ queryKey: ['faculty-schedule', facultyId] });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update schedule');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const toggleDay = (day) => {
    const current = [...selectedDays];
    if (current.includes(day)) {
      setValue('days', current.filter(d => d !== day), { shouldValidate: true });
    } else {
      setValue('days', [...current, day], { shouldValidate: true });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Schedule"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={handleSubmit(onSubmit)} 
            disabled={mutation.isPending}
            className="btn-primary shadow-lg shadow-accent/20"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Course Info (Read-only) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Course Name</p>
          <p className="font-bold text-primary-900">{schedule?.course_name}</p>
        </div>

        {/* Days Multi-select */}
        <div>
          <label className="form-label flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-accent" /> Select Days
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  selectedDays.includes(day)
                    ? 'bg-accent border-accent text-white shadow-md shadow-accent/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-accent/50'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          {errors.days && <p className="text-xs text-danger mt-2 font-medium">{errors.days.message}</p>}
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Start Time
            </label>
            <input 
              {...register('start_time')} 
              placeholder="e.g. 10:00 AM"
              className={errors.start_time ? "form-input-error" : "form-input"} 
            />
            {errors.start_time && <p className="form-error">{errors.start_time.message}</p>}
          </div>
          <div>
            <label className="form-label flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> End Time
            </label>
            <input 
              {...register('end_time')} 
              placeholder="e.g. 11:30 AM"
              className={errors.end_time ? "form-input-error" : "form-input"} 
            />
            {errors.end_time && <p className="form-error">{errors.end_time.message}</p>}
          </div>
        </div>

        {/* Mode & Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Mode</label>
            <select {...register('mode')} className="form-select">
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          <div>
            <label className="form-label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" /> Venue / Platform
            </label>
            <input 
              {...register('venue')} 
              placeholder="Zoom / Room 301"
              className={errors.venue ? "form-input-error" : "form-input"} 
            />
            {errors.venue && <p className="form-error">{errors.venue.message}</p>}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Optional Note
          </label>
          <textarea 
            {...register('note')} 
            rows={2}
            className="form-input resize-none"
            placeholder="Additional information for students..."
          />
        </div>
      </div>
    </Modal>
  );
}
