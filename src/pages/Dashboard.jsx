import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import SummaryCard from '../components/SummaryCard';
import RecentActivity from '../components/RecentActivity';
import QuickRepaymentModal from '../components/QuickRepaymentModal';
import { calculateLoanStats } from '../utils/calculations';
import { formatCurrency } from '../utils/format';
import { Wallet, TrendingUp, AlertCircle, Clock, Plus } from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState([]);

    const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
    const [repaymentLoading, setRepaymentLoading] = useState(false);

    async function fetchData() {
        try {
            setLoading(true); // Maybe dont set global loading on refresh? 
            // Better to keep global loading for init only.
            // Let's refactor fetchData to be reusable without forcing full page loader if we want.
            // But for now, simple is fine. 
            const data = await loanService.getAllLoansWithRepayments(currentUser.uid);
            setLoans(data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    async function handleQuickRepayment({ loanId, repaymentData }) {
        try {
            setRepaymentLoading(true);
            await loanService.addRepayment(currentUser.uid, loanId, repaymentData);
            await fetchData(); // Refresh data
            setIsRepaymentModalOpen(false);
        } catch (error) {
            console.error("Failed to add repayment", error);
            alert("Error adding repayment");
        } finally {
            setRepaymentLoading(false);
        }
    }

    const stats = useMemo(() => {
        let totalActive = 0;
        let totalOutstanding = 0;
        let totalInterest = 0; // Approximation: Interest Received
        let totalOverdue = 0; // Placeholder until we have overdue logic

        const activities = [];

        loans.forEach(loan => {
            const { remainingBalance, totalRepaid, principal, isDelayed } = calculateLoanStats(loan, loan.repayments);

            if (loan.status === 'ACTIVE') {
                totalActive++;
                totalOutstanding += remainingBalance;
                if (isDelayed) {
                    totalOverdue++; // Using totalOverdue variable for delayed count
                }
            }

            // Interest-First Model: Count repayments towards interest first, up to total interest accrued
            const { interestAccrued } = calculateLoanStats(loan, loan.repayments);
            totalInterest += Math.min(totalRepaid, interestAccrued);

            // Add to activities
            activities.push({
                id: loan.id,
                type: 'LOAN_CREATED',
                description: `கடன் கொடுத்தது: ${loan.borrowerName}`,
                amount: principal,
                date: loan.startDate?.toDate ? loan.startDate.toDate() : new Date(loan.startDate)
            });

            loan.repayments.forEach(rep => {
                activities.push({
                    id: rep.id,
                    type: 'REPAYMENT',
                    description: `வரவு வந்தது: ${loan.borrowerName}`,
                    amount: rep.amount,
                    date: rep.date?.toDate ? rep.date.toDate() : new Date(rep.date)
                });
            });
        });

        // Sort activities des
        activities.sort((a, b) => b.date - a.date);

        return {
            totalActive,
            totalOutstanding,
            totalInterest,
            totalOverdue, // This is now 'delayedCount' basically
            recentActivity: activities.slice(0, 5)
        };
    }, [loans]);

    if (loading) {
        return <div className="flex justify-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">முகப்பு</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRepaymentModalOpen(true)}
                        className="btn btn-secondary flex items-center gap-2 text-sm"
                    >
                        வரவு வை
                    </button>
                    <Link to="/loans/new" className="btn btn-primary sm:hidden flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> புதிய கடன்
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/loans?status=ACTIVE" className="block">
                    <SummaryCard
                        title="செயலில் உள்ள கடன்கள்"
                        value={stats.totalActive}
                        icon={Wallet}
                        colorClass="text-blue-600"
                        bgClass="bg-blue-50"
                    />
                </Link>
                <SummaryCard
                    title="நிலுவை அசல்"
                    value={formatCurrency(stats.totalOutstanding)}
                    subtext="அசல் + வட்டி"
                    icon={Clock}
                    colorClass="text-orange-600"
                    bgClass="bg-orange-50"
                />
                <SummaryCard
                    title="வட்டி வருமானம்"
                    value={formatCurrency(stats.totalInterest)}
                    subtext="பெறப்பட்ட வட்டி"
                    icon={TrendingUp}
                    colorClass="text-green-600"
                    bgClass="bg-green-50"
                />
                <Link to="/loans?status=DELAYED" className="block">
                    <SummaryCard
                        title="தாமதமான கடன்கள்"
                        value={stats.totalOverdue}
                        subtext="வட்டி செலுத்தாதவை"
                        icon={AlertCircle}
                        colorClass="text-red-600"
                        bgClass="bg-red-50"
                    />
                </Link>
            </div>

            <RecentActivity activities={stats.recentActivity} />

            <QuickRepaymentModal
                isOpen={isRepaymentModalOpen}
                onClose={() => setIsRepaymentModalOpen(false)}
                onSubmit={handleQuickRepayment}
                loading={repaymentLoading}
                loans={loans.filter(l => l.status === 'ACTIVE')}
            />
        </div>
    );
}
