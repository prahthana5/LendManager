import { differenceInMonths, differenceInDays } from 'date-fns';

export const calculateLoanStats = (loan, repayments) => {
    const principal = parseFloat(loan.principal) || 0;
    const rate = parseFloat(loan.interestRate) || 0; // Monthly rate
    const startDate = loan.startDate?.toDate ? loan.startDate.toDate() : new Date(loan.startDate);

    // Total repaid
    const totalRepaid = repayments.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    // Calculate Interest Accrued (Simple Interest for now)
    // Time diff in months
    const now = new Date();
    const monthsElapsed = differenceInMonths(now, startDate) + (differenceInDays(now, startDate) % 30) / 30;

    let interestAccrued = 0;
    if (loan.interestType === 'COMPOUND') {
        // A = P(1 + r/100)^t
        const amount = principal * Math.pow((1 + rate / 100), monthsElapsed);
        interestAccrued = amount - principal;
    } else {
        // Simple Interest: P * R/100 * T (months)
        interestAccrued = principal * (rate / 100) * monthsElapsed;
    }

    // NOTE: This is a simplified "Total Due" calculation. 
    // Real accounting needs to deduce repayments from principal/interest over time.
    // For a basic version, we can assume:
    // Total Balance = (Principal + InterestAccrued) - TotalRepaid

    const totalDue = (principal + interestAccrued);
    const remainingBalance = totalDue - totalRepaid;

    // Delayed Logic
    // User definition: "paid only interest on repayment schedule".
    // So we check if TotalRepaid < Expected Interest for completed periods.
    let isDelayed = false;
    if (loan.status === 'ACTIVE' && loan.paymentFrequency !== 'FLOATING') {
        let periodsElapsed = 0;
        let interestPerPeriod = 0;

        if (loan.paymentFrequency === 'WEEKLY') {
            periodsElapsed = Math.floor(differenceInDays(now, startDate) / 7);
            interestPerPeriod = principal * (rate / 100) / 4; // Approx 4 weeks/mo
        } else if (loan.paymentFrequency === 'BIWEEKLY') {
            periodsElapsed = Math.floor(differenceInDays(now, startDate) / 14);
            interestPerPeriod = principal * (rate / 100) / 2; // Approx 2 biweeks/mo
        } else {
            // Default to MONTHLY
            periodsElapsed = differenceInMonths(now, startDate);
            interestPerPeriod = principal * (rate / 100);
        }

        const expectedRepayment = periodsElapsed * interestPerPeriod;
        // Allow a small buffer (e.g. 1 rupee) for floating point errors
        if (totalRepaid < (expectedRepayment - 1)) {
            isDelayed = true;
        }
    }

    return {
        principal,
        totalRepaid,
        interestAccrued,
        remainingBalance,
        totalDue,
        isDelayed
    };
};
