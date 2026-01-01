import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

export default function RepaymentModal({ isOpen, onClose, onSubmit, loading }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            amount: parseFloat(amount),
            date: Timestamp.fromDate(new Date(date)),
            remarks
        });
        // Reset form handled by parent or effect? Better here but strictly if success.
        setAmount('');
        setRemarks('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">வரவு சேர்க்க</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            rows="2"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            ரத்து
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'சேமிக்கிறது...' : 'சேமி'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
