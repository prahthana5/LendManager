import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import { calculateLoanStats } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/format';
import RepaymentModal from '../components/RepaymentModal';
import CloseLoanModal from '../components/CloseLoanModal';
import { ArrowLeft, Edit, Plus, Trash2, CheckSquare } from 'lucide-react';

export default function LoanDetails() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const fetchLoan = useCallback(async () => {
        try {
            setLoading(true);
            const data = await loanService.getLoanWithRepayments(currentUser.uid, id);
            setLoan(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, id]);

    useEffect(() => {
        if (currentUser) fetchLoan();
    }, [currentUser, fetchLoan]);

    async function handleAddRepayment(data) {
        try {
            setProcessing(true);
            await loanService.addRepayment(currentUser.uid, id, data);
            setIsModalOpen(false);
            await fetchLoan(); // Refresh data
        } catch (err) {
            console.error(err);
            alert("Failed to add repayment");
        } finally {
            setProcessing(false);
        }
    }

    async function handleCloseLoan(repaymentData) {
        try {
            setProcessing(true);
            await loanService.closeLoan(currentUser.uid, id, repaymentData);
            setIsCloseModalOpen(false);
            await fetchLoan();
        } catch (err) {
            console.error(err);
            alert("Failed to close loan");
        } finally {
            setProcessing(false);
        }
    }

    if (loading) return <div className="p-8 text-center bg-slate-50 min-h-screen">Loading details...</div>;
    if (!loan) return <div className="p-8 text-center text-red-500 bg-slate-50 min-h-screen">Loan not found</div>;

    const stats = calculateLoanStats(loan, loan.repayments);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link to="/loans" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{loan.borrowerName}</h1>
                </div>
                <div className="flex gap-2">
                    {loan.status === 'ACTIVE' && (
                        <button
                            onClick={() => setIsCloseModalOpen(true)}
                            className="btn bg-red-50 text-red-600 hover:bg-red-100 border-red-200 flex items-center gap-2 text-sm"
                        >
                            <CheckSquare className="w-4 h-4" /> கடன் முடி
                        </button>
                    )}
                    <Link to={`/loans/${id}/edit`} className="btn btn-secondary flex items-center gap-2 text-sm">
                        <Edit className="w-4 h-4" /> திருத்து
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4 bg-orange-50 border-orange-100">
                    <p className="text-sm text-orange-800 mb-1">மீதமுள்ள தொகை</p>
                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.remainingBalance)}</p>
                    <p className="text-xs text-orange-700 mt-2">அசல்: {formatCurrency(stats.principal)} + வட்டி: {formatCurrency(stats.interestAccrued)}</p>
                </div>
                <div className="card p-4 bg-green-50 border-green-100">
                    <p className="text-sm text-green-800 mb-1">மொத்த வசூல்</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRepaid)}</p>
                    <p className="text-xs text-green-700 mt-2">மொத்த நிலுவையில் {((stats.totalRepaid / stats.totalDue) * 100).toFixed(1)}%</p>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">வட்டி விகிதம்</span>
                        <span className="font-medium">{loan.interestRate}% / மாதம்</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">தவணை முறை</span>
                        <span className="font-medium capitalize">{loan.paymentFrequency.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">தொடங்கிய தேதி</span>
                        <span className="font-medium">{formatDate(loan.startDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">நிலை</span>
                        <span className={`font-medium ${loan.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-600'}`}>
                            {loan.status === 'ACTIVE' ? 'செயலில்' : 'முடிந்தது'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Repayments History */}
            <div className="card">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">வரவு வரலாறு</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary btn-sm flex items-center gap-2 py-1.5"
                    >
                        <Plus className="w-4 h-4" /> வரவு வை
                    </button>
                </div>
                <div className="divide-y divide-slate-200">
                    {loan.repayments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">வரவு எதுவும் இல்லை.</div>
                    ) : (
                        loan.repayments.map((rep) => (
                            <div key={rep.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-green-600">+{formatCurrency(rep.amount)}</p>
                                    <p className="text-xs text-slate-500">{formatDate(rep.date)}</p>
                                </div>
                                <div className="text-right">
                                    {rep.remarks && <p className="text-sm text-slate-600">{rep.remarks}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <RepaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRepayment}
                loading={processing}
            />

            <CloseLoanModal
                isOpen={isCloseModalOpen}
                onClose={() => setIsCloseModalOpen(false)}
                onSubmit={handleCloseLoan}
                loading={processing}
                outstandingBalance={stats.remainingBalance > 0 ? stats.remainingBalance : ''}
            />
        </div>
    );
}
