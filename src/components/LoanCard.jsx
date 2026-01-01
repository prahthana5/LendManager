import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';
import { calculateLoanStats } from '../utils/calculations';
import { User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoanCard({ loan }) {
    const stats = calculateLoanStats(loan, loan.repayments || []);
    const isActive = loan.status === 'ACTIVE';

    // Status Logic: 
    // If Active and remainingBalance > 0 -> Active
    // If Active and remainingBalance <= 0 -> PAID (Should be Closed?)
    // For now just use loan.status

    return (
        <Link to={`/loans/${loan.id}`} className="block">
            <div className="card hover:shadow-md transition-shadow">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <User className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">{loan.borrowerName}</h3>
                                <p className="text-xs text-slate-500">{formatDate(loan.startDate)}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {isActive ? 'செயலில்' : 'முடிந்தது'}
                        </span>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">அசல்</span>
                            <span className="font-medium">{formatCurrency(loan.principal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">வட்டி</span>
                            <span className="font-medium">{loan.interestRate}% / மாதம்</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                            <span className="text-slate-500">மொத்தம்</span>
                            <span className="font-bold text-slate-900">{formatCurrency(stats.remainingBalance)}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 flex justify-between">
                    <span>{loan.interestType}</span>
                    <span>{loan.paymentFrequency}</span>
                </div>
            </div>
        </Link>
    );
}
