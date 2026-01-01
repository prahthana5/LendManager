import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

export default function CloseLoanModal({ isOpen, onClose, onSubmit, loading, outstandingBalance }) {
    const [addFinalPayment, setAddFinalPayment] = useState(false);
    const [amount, setAmount] = useState(outstandingBalance || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('கடன் முடிப்பு வரவு'); // Default: Loan settlement payment

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        let repaymentData = null;
        if (addFinalPayment) {
            repaymentData = {
                amount: parseFloat(amount),
                date: Timestamp.fromDate(new Date(date)),
                remarks
            };
        }

        onSubmit(repaymentData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-900">கடனை முடிக்க</h2>

                <p className="text-sm text-slate-500 mb-6">
                    இந்தக் கடனை முடிக்க விரும்புகிறீர்களா? இதை மாற்ற முடியாது.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="finalPayment"
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            checked={addFinalPayment}
                            onChange={(e) => setAddFinalPayment(e.target.checked)}
                        />
                        <label htmlFor="finalPayment" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                            இறுதி வரவு சேர்க்கவும்
                        </label>
                    </div>

                    {addFinalPayment && (
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">தொகை (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="input-field mt-1"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">தேதி</label>
                                <input
                                    type="date"
                                    required
                                    className="input-field mt-1"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">குறிப்பு</label>
                                <textarea
                                    className="input-field mt-1"
                                    rows="1"
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            ரத்து
                        </button>
                        <button type="submit" disabled={loading} className="btn bg-red-600 text-white hover:bg-red-700 border-transparent">
                            {loading ? 'முடிக்கிறது...' : 'கடன் முடி'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
