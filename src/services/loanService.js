import { db } from '../lib/firebase';
import {
    collection,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs
} from 'firebase/firestore';

export const loanService = {
    getLoansCollection(userId) {
        return collection(db, 'users', userId, 'loans');
    },

    getLoanRef(userId, loanId) {
        return doc(db, 'users', userId, 'loans', loanId);
    },

    getRepaymentsCollection(userId, loanId) {
        return collection(db, 'users', userId, 'loans', loanId, 'repayments');
    },

    async createLoan(userId, loanData) {
        const loansRef = this.getLoansCollection(userId);
        return addDoc(loansRef, {
            ...loanData,
            status: 'ACTIVE',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    async updateLoan(userId, loanId, data) {
        const loanRef = this.getLoanRef(userId, loanId);
        return updateDoc(loanRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    async addRepayment(userId, loanId, repaymentData) {
        const repaymentsRef = this.getRepaymentsCollection(userId, loanId);
        const repayment = await addDoc(repaymentsRef, {
            ...repaymentData,
            createdAt: serverTimestamp()
        });
        return repayment;
    },

    async getAllLoansWithRepayments(userId) {
        const loansRef = this.getLoansCollection(userId);
        const loansSnap = await getDocs(query(loansRef, orderBy('createdAt', 'desc')));

        const loans = loansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const fullData = await Promise.all(loans.map(async (loan) => {
            const repaymentsRef = this.getRepaymentsCollection(userId, loan.id);
            const repSnap = await getDocs(query(repaymentsRef, orderBy('date', 'desc')));
            const repayments = repSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { ...loan, repayments };
        }));

        return fullData;
    },

    async getLoanWithRepayments(userId, loanId) {
        const loanRef = this.getLoanRef(userId, loanId);
        const loanSnap = await getDoc(loanRef);

        if (!loanSnap.exists()) return null;

        const loan = { id: loanSnap.id, ...loanSnap.data() };

        const repaymentsRef = this.getRepaymentsCollection(userId, loanId);
        const repSnap = await getDocs(query(repaymentsRef, orderBy('date', 'desc')));
        const repayments = repSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { ...loan, repayments };
    },

    async closeLoan(userId, loanId, finalRepaymentData) {
        // If there's a final payment, add it first (or potentially batch it, but sequential is fine for now)
        if (finalRepaymentData && finalRepaymentData.amount > 0) {
            await this.addRepayment(userId, loanId, finalRepaymentData);
        }

        const loanRef = this.getLoanRef(userId, loanId);
        return updateDoc(loanRef, {
            status: 'CLOSED',
            updatedAt: serverTimestamp()
        });
    }
};
