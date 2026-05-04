import { TrendingUp } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = "indigo", trend }) {
  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50",
    teal: "text-teal-600 bg-teal-50",
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    green: "text-emerald-600 bg-emerald-50",
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="card group hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500 ${selectedColor.split(' ')[0]}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-muted mb-1">{label}</p>
          <h3 className="text-3xl font-display font-bold text-primary-900">{value || 0}</h3>
          {trend && (
            <p className="text-[10px] font-bold text-success mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 ${selectedColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
