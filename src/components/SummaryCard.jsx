export default function SummaryCard({ title, value, subtext, icon: Icon, colorClass = "text-primary-600", bgClass = "bg-primary-50" }) {
    return (
        <div className="card p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                {subtext && <p className="mt-1 text-sm text-slate-500">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${bgClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
        </div>
    );
}
