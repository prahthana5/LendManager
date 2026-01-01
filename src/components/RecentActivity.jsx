import { formatCurrency, formatDate } from '../utils/format';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function RecentActivity({ activities }) {
    return (
        <div className="card">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">சமீபத்திய செயல்பாடுகள்</h3>
            </div>
            <div className="divide-y divide-slate-200">
                {activities.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">சமீபத்திய செயல்பாடு இல்லை</div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${item.type === 'LOAN_CREATED' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    {item.type === 'LOAN_CREATED' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{item.description}</p>
                                    <p className="text-sm text-slate-500">{formatDate(item.date)}</p>
                                </div>
                            </div>
                            <span className={`font-medium ${item.type === 'LOAN_CREATED' ? 'text-slate-900' : 'text-green-600'}`}>
                                {item.type === 'LOAN_CREATED' ? '-' : '+'}{formatCurrency(item.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
