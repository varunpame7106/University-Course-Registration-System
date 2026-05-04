'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Testimonial = {
  image: string;
  audio?: string;
  text: string;
  name: string;
  jobtitle: string;
};

type ComponentProps = {
  testimonials: Testimonial[];
};

export const TypewriterTestimonial: React.FC<ComponentProps> = ({ testimonials }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [hasBeenHovered, setHasBeenHovered] = useState<boolean[]>(
    new Array(testimonials.length).fill(false)
  );
  const [typedText, setTypedText] = useState('');
  const typewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.src = '';
      audioPlayerRef.current.load();
      audioPlayerRef.current = null;
    }
  }, []);

  const startTypewriter = useCallback((text: string) => {
    if (typewriterTimeoutRef.current) clearTimeout(typewriterTimeoutRef.current);
    setTypedText('');
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i));
        i++;
        typewriterTimeoutRef.current = setTimeout(type, 40);
      }
    };
    type();
  }, []);

  const stopTypewriter = useCallback(() => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      typewriterTimeoutRef.current = null;
    }
    setTypedText('');
  }, []);

  const handleMouseEnter = useCallback(
    (index: number) => {
      stopAudio();
      setHoveredIndex(index);

      // Audio is optional — gracefully skip if no audio field
      if (testimonials[index].audio) {
        const newAudio = new Audio(`/audio/${testimonials[index].audio}`);
        audioPlayerRef.current = newAudio;
        newAudio.play().catch(() => {/* silently skip if blocked */});
      }

      setHasBeenHovered((prev) => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });

      startTypewriter(testimonials[index].text);
    },
    [testimonials, stopAudio, startTypewriter]
  );

  const handleMouseLeave = useCallback(() => {
    stopAudio();
    setHoveredIndex(null);
    stopTypewriter();
  }, [stopAudio, stopTypewriter]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopTypewriter();
    };
  }, [stopAudio, stopTypewriter]);

  return (
    <div className="flex justify-center items-end gap-3 flex-wrap">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          className="relative flex flex-col items-center"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            animate={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor:
                hoveredIndex === index || hasBeenHovered[index]
                  ? '#6366F1'  // accent color — UCRS indigo
                  : 'rgba(255,255,255,0.2)',
            }}
            transition={{ duration: 0.3 }}
          />

          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: -4 }}
                exit={{ opacity: 0, scale: 0.85, y: 4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute bottom-14 z-50 w-60 rounded-2xl shadow-2xl border border-white/10"
                style={{ background: '#1e2340' }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />

                <div className="relative p-4">
                  {/* Typewriter text area */}
                  <div className="h-20 overflow-hidden text-xs leading-relaxed text-white/80 whitespace-pre-wrap font-medium">
                    {typedText}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-[2px] h-3 bg-indigo-400 ml-0.5 align-middle"
                    />
                  </div>

                  {/* Divider */}
                  <div className="my-2.5 h-px bg-white/10" />

                  {/* Author */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-7 h-7 rounded-full object-cover border border-indigo-400/40 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white text-[11px] font-bold truncate">{testimonial.name}</p>
                      <p className="text-indigo-300/70 text-[10px] truncate">{testimonial.jobtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Bubble tail */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] flex flex-col items-center gap-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1e2340] border border-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e2340] border border-white/10" />
                  <div className="w-1 h-1 rounded-full bg-[#1e2340]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};
