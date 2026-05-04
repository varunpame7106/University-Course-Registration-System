export default function Badge({ status, variant }) {
  if (variant === 'online') return <span className="badge-online">Online</span>;
  if (variant === 'offline') return <span className="badge-offline">Offline</span>;

  switch (status) {
    case 'Pending':
      return <span className="badge-pending">Pending</span>;
    case 'Approved':
      return <span className="badge-approved">Approved</span>;
    case 'Dropped':
    case 'Rejected':
      return <span className="badge-dropped">{status}</span>;
    default:
      return <span className="badge bg-primary-100 text-primary-600 border border-primary-200">{status}</span>;
  }
}
