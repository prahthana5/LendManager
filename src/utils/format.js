export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    // Handle Firestore Timestamp or Date object or string
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ta-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
};
