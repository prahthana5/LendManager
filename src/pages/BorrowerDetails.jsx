import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import { calculateLoanStats } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/format';
import { ArrowLeft, User, Calendar, ReceiptText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BorrowerDetails() {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name);
    const { currentUser } = useAuth();
    const [data, setData] = useState({ loans: [], timeline: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBorrowerData() {
            try {
                const allLoans = await loanService.getAllLoansWithRepayments(currentUser.uid);
                const borrowerLoans = allLoans.filter(l => l.borrowerName === decodedName);

                // Construct timeline
                let timeline = [];
                borrowerLoans.forEach(loan => {
                    // 1. Initial Loan
                    timeline.push({
                        id: `loan-${loan.id}`,
                        date: loan.startDate,
                        type: 'LENT',
                        amount: loan.principal,
                        description: `கடன் வழங்கப்பட்டது: ${formatCurrency(loan.principal)}`,
                        loanId: loan.id
                    });

                    // 2. Repayments
                    loan.repayments.forEach(rep => {
                        timeline.push({
                            id: `rep-${rep.id}`,
                            date: rep.date,
                            type: 'REPAYMENT',
                            amount: rep.amount,
                            description: rep.remarks ? `வரவு: ${rep.remarks}` : `வட்டி வரவு`,
                            loanId: loan.id
                        });
                    });
                });

                // Sort timeline by date descending
                const processedTimeline = timeline.map(item => ({
                    ...item,
                    dateObj: item.date?.toDate ? item.date.toDate() : new Date(item.date)
                })).sort((a, b) => b.dateObj - a.dateObj);

                setData({ loans: borrowerLoans, timeline: processedTimeline });
            } catch (err) {
                console.error("Failed to fetch borrower details:", err);
            } finally {
                setLoading(false);
            }
        }

        if (currentUser && name) fetchBorrowerData();
    }, [currentUser, name, decodedName]);

    if (loading) return <div className="p-8 text-center text-slate-500">ஏற்றப்படுகிறது...</div>;

    const netPending = data.loans
        .filter(l => l.status === 'ACTIVE')
        .reduce((sum, loan) => sum + calculateLoanStats(loan, loan.repayments).remainingBalance, 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <Link to="/borrowers" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{decodedName}</h1>
            </div>

            {/* Summary Card */}
            <div className="card p-6 bg-white border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-full">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">மொத்த நிலுவைத் தொகை</p>
                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(netPending)}</p>
                    </div>
                </div>
            </div>

            {/* Table 1: Loans */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
                    <ReceiptText className="w-5 h-5 text-orange-500" /> கடன்கள் விவரம்
                </h2>
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">தேதி</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">அசல்</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">நிலுவை</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">நிலை</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {data.loans.map(loan => {
                                    const stats = calculateLoanStats(loan, loan.repayments);
                                    return (
                                        <tr key={loan.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-slate-700">
                                                <Link to={`/loans/${loan.id}`} className="hover:text-primary-600 font-medium">
                                                    {formatDate(loan.startDate)}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-900 font-medium">
                                                {formatCurrency(loan.principal)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-orange-600">
                                                {formatCurrency(loan.status === 'ACTIVE' ? stats.remainingBalance : 0)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${loan.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {loan.status === 'ACTIVE' ? 'செயலில்' : 'முடிந்தது'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Table 2: Timeline */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
                    <Calendar className="w-5 h-5 text-primary-500" /> பரிவர்த்தனை வரலாறு
                </h2>
                <div className="card divide-y divide-slate-100">
                    {data.timeline.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">வரலாறு எதுவும் இல்லை.</div>
                    ) : (
                        data.timeline.map(item => (
                            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${item.type === 'LENT' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {item.type === 'LENT' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.description}</p>
                                        <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${item.type === 'LENT' ? 'text-red-600' : 'text-green-600'}`}>
                                    {item.type === 'LENT' ? '-' : '+'}{formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
