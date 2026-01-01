import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import LoanCard from '../components/LoanCard';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

export default function LoanList() {
    const { currentUser } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, CLOSED
    const [search, setSearch] = useState('');

    useEffect(() => {
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
        if (currentUser) fetchLoans();
    }, [currentUser]);

    const filteredLoans = loans.filter(loan => {
        const matchesStatus = filter === 'ALL' || loan.status === filter;
        const matchesSearch = loan.borrowerName.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div className="p-8 text-center">Loading loans...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">உங்கள் கடன்கள்</h1>
                <Link to="/loans/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> புதிய கடன்
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
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
                    className="input-field w-full sm:w-auto"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="ALL">அனைத்தும்</option>
                    <option value="ACTIVE">செயலில்</option>
                    <option value="CLOSED">முடிந்தது</option>
                </select>
            </div>

            {filteredLoans.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">கடன்கள் எதுவும் இல்லை.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLoans.map(loan => (
                        <LoanCard key={loan.id} loan={loan} />
                    ))}
                </div>
            )}
        </div>
    );
}
