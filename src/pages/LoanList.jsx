import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { calculateLoanStats } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/format';

export default function LoanList() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get('status') || 'ALL'); // ALL, ACTIVE, CLOSED, DELAYED
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (currentUser) fetchLoans();
    }, [currentUser]);

    // Sync filter with URL status parameter
    useEffect(() => {
        const status = searchParams.get('status');
        if (status) {
            setFilter(status);
        }
    }, [searchParams]);

    async function fetchLoans() {
        try {
            const data = await loanService.getAllLoansWithRepayments(currentUser.uid);
            setLoans(data);
        } catch (err) {
            console.error("Failed to fetch loans", err);
        } finally {
            setLoading(false);
        }
    }

    const filteredLoans = loans.filter(loan => {
        let matchesStatus = false;
        if (filter === 'ALL') {
            matchesStatus = true;
        } else if (filter === 'DELAYED') {
            const stats = calculateLoanStats(loan, loan.repayments);
            matchesStatus = stats.isDelayed;
        } else {
            matchesStatus = loan.status === filter;
        }

        const matchesSearch = loan.borrowerName.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div className="p-8 text-center text-slate-500">ஏற்றப்படுகிறது...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">உங்கள் கடன்கள்</h1>
                <Link to="/loans/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> புதிய கடன்
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="relative col-span-1 sm:col-span-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="பெயர் தேட..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="input-field"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="ALL">அனைத்தும்</option>
                    <option value="ACTIVE">செயலில்</option>
                    <option value="DELAYED">தாமதமானவை</option>
                    <option value="CLOSED">முடிந்தது</option>
                </select>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">தேதி</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">பெறுபவர்</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-right">அசல்</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-right">நிலுவை</th>
                                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-center">நிலை</th>
                                <th className="px-4 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        கடன்கள் எதுவும் இல்லை.
                                    </td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => {
                                    const stats = calculateLoanStats(loan, loan.repayments || []);
                                    const isActive = loan.status === 'ACTIVE';
                                    const isDelayed = isActive && stats.isDelayed;

                                    return (
                                        <tr
                                            key={loan.id}
                                            className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                        >
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {formatDate(loan.startDate)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                                                    {loan.borrowerName}
                                                </p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                                                    {loan.interestRate}% • {loan.paymentFrequency.toLowerCase()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-slate-700">
                                                {formatCurrency(loan.principal)}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <p className={`text-sm font-bold ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                                                    {formatCurrency(isActive ? stats.remainingBalance : 0)}
                                                </p>
                                                {isDelayed && (
                                                    <p className="text-[10px] text-red-500 font-medium">தாமதம்</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isActive ? (isDelayed ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600') : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {isActive ? (isDelayed ? 'தாமதம்' : 'செயலில்') : 'முடிந்தது'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500" />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
