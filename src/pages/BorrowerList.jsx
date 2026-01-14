import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import { calculateLoanStats } from '../utils/calculations';
import { formatCurrency } from '../utils/format';
import { Users, ChevronRight } from 'lucide-react';

export default function BorrowerList() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAndGroup() {
            try {
                const loans = await loanService.getAllLoansWithRepayments(currentUser.uid);

                const grouped = loans.reduce((acc, loan) => {
                    const stats = calculateLoanStats(loan, loan.repayments);
                    const name = loan.borrowerName || 'Unknown';

                    if (!acc[name]) {
                        acc[name] = {
                            name,
                            totalLent: 0,
                            totalPending: 0,
                            loanCount: 0
                        };
                    }

                    acc[name].totalLent += stats.principal;
                    if (loan.status === 'ACTIVE') {
                        acc[name].totalPending += stats.remainingBalance;
                    }
                    acc[name].loanCount += 1;

                    return acc;
                }, {});

                setBorrowers(Object.values(grouped).sort((a, b) => b.totalPending - a.totalPending));
            } catch (err) {
                console.error("Failed to fetch borrowers:", err);
            } finally {
                setLoading(false);
            }
        }

        if (currentUser) fetchAndGroup();
    }, [currentUser]);

    if (loading) return <div className="p-8 text-center text-slate-500">ஏற்றப்படுகிறது...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary-600" /> நபர்கள்
                </h1>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">பெயர்</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">மொத்த அசல்</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">நிலுவைத் தொகை</th>
                                <th className="px-6 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {borrowers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                                        நபர்கள் யாரும் இல்லை.
                                    </td>
                                </tr>
                            ) : (
                                borrowers.map((b) => (
                                    <tr
                                        key={b.name}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/borrowers/${encodeURIComponent(b.name)}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="block">
                                                <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">{b.name}</p>
                                                <p className="text-xs text-slate-500">{b.loanCount} கடன்கள்</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                            {formatCurrency(b.totalLent)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${b.totalPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {formatCurrency(b.totalPending)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
