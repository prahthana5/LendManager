import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/loanService';
import { Timestamp } from 'firebase/firestore';
import { ArrowLeft, Contact } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoanForm() {
    const { id } = useParams();
    const isEditMode = !!id;
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        borrowerName: '',
        principal: '',
        interestRate: '',
        interestType: 'SIMPLE',
        paymentFrequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0]
    });

    // Check if Contact Picker API is supported
    const isContactPickerSupported = 'contacts' in navigator && 'ContactsManager' in window;

    async function handleContactSelect() {
        try {
            const props = ['name'];
            const opts = { multiple: false };

            const contacts = await navigator.contacts.select(props, opts);

            if (contacts.length > 0) {
                const contact = contacts[0];
                if (contact.name && contact.name.length > 0) {
                    setFormData(prev => ({ ...prev, borrowerName: contact.name[0] }));
                }
            }
        } catch (err) {
            console.error("Contact picker error:", err);
            // Ignore abort error
        }
    }

    useEffect(() => {
        if (isEditMode && currentUser) {
            async function fetchLoan() {
                try {
                    // We don't have getLoanById in service exposed simply, but we can reuse logic or just fetch one doc
                    // Let's add getLoan to service or just query here?
                    // I didn't add getLoan to service. I'll hack it here or add it.
                    // Better to add it to service, but for speed I'll use list filtered or adding a method is better.
                    // Wait, I can't restart service file easily.
                    // I'll just use getLoansCollection and filter or doc ref.
                    // Actually, I can use `getDoc(doc(db...))` here.
                    // I will proceed with creating a helper here or directly importing firestore methods.

                    // Actually, I should have added `getLoan` to `loanService`.
                    // I will assume I can modify `loanService` later or use the `getAllLoans` and find.
                    // Since I haven't implemented `getLoan` and don't want to rewrite service file right now unless needed.
                    // I'll fetch all and find (not efficient but consistent with current service).

                    setLoading(true);
                    const allLoans = await loanService.getAllLoansWithRepayments(currentUser.uid);
                    const loan = allLoans.find(l => l.id === id);
                    if (loan) {
                        setFormData({
                            borrowerName: loan.borrowerName,
                            principal: loan.principal,
                            interestRate: loan.interestRate,
                            interestType: loan.interestType,
                            paymentFrequency: loan.paymentFrequency,
                            startDate: loan.startDate?.toDate ? loan.startDate.toDate().toISOString().split('T')[0] : loan.startDate
                        });
                    } else {
                        // Handle 404
                        navigate('/loans');
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
            fetchLoan();
        }
    }, [isEditMode, id, currentUser, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                borrowerName: formData.borrowerName,
                principal: parseFloat(formData.principal),
                interestRate: parseFloat(formData.interestRate),
                interestType: formData.interestType,
                paymentFrequency: formData.paymentFrequency,
                startDate: Timestamp.fromDate(new Date(formData.startDate))
            };

            const savePromise = isEditMode
                ? loanService.updateLoan(currentUser.uid, id, payload)
                : loanService.createLoan(currentUser.uid, payload);

            // Timeout after 10 seconds to handle blocked requests
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out. Please check your internet connection or disable ad blockers.")), 10000)
            );

            await Promise.race([savePromise, timeoutPromise]);
            navigate('/loans');
        } catch (error) {
            console.error("Failed to save loan", error);
            if (error.message.includes("timed out")) {
                alert(error.message);
            } else {
                alert("Error saving loan: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <Link to="/loans" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? 'கடனை திருத்து' : 'புதிய கடன்'}
                </h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">பெறுபவர் பெயர்</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                required
                                className="input-field flex-1"
                                value={formData.borrowerName}
                                onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
                            />
                            {isContactPickerSupported && (
                                <button
                                    type="button"
                                    onClick={handleContactSelect}
                                    className="btn btn-secondary px-3"
                                    title="தொடர்புகளிலிருந்து தேர்ந்தெடு"
                                >
                                    <Contact className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">அசல் தொகை (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className="input-field mt-1"
                                value={formData.principal}
                                onChange={e => setFormData({ ...formData, principal: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">வட்டி விகிதம் (% மாதம்)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className="input-field mt-1"
                                value={formData.interestRate}
                                onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">வட்டி முறை</label>
                            <select
                                className="input-field mt-1"
                                value={formData.interestType}
                                onChange={e => setFormData({ ...formData, interestType: e.target.value })}
                            >
                                <option value="SIMPLE">தனி வட்டி</option>
                                <option value="COMPOUND">கூட்டு வட்டி</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">தவணை முறை</label>
                            <select
                                className="input-field mt-1"
                                value={formData.paymentFrequency}
                                onChange={e => setFormData({ ...formData, paymentFrequency: e.target.value })}
                            >
                                <option value="WEEKLY">வாரம்</option>
                                <option value="BIWEEKLY">இரு வாரம்</option>
                                <option value="MONTHLY">மாதம்</option>
                                <option value="FLOATING">மிதக்கும்</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">தேதி</label>
                        <input
                            type="date"
                            required
                            className="input-field mt-1"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/loans')}
                            className="flex-1 btn btn-secondary"
                        >
                            ரத்து
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn btn-primary"
                        >
                            {loading ? 'சேமிக்கிறது...' : 'சேமி'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
