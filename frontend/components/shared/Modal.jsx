import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-xl font-display font-bold text-primary-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-primary-50 text-muted hover:text-primary-900 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
