# Requirements for Lend Manager

## 1. Introduction
**Lend Manager** is a personal Peer-to-Peer (P2P) lending management application designed to track loans given to and taken from friends, family, or acquaintances. The goal is to provide a simple, text-based interface to record financial transactions without complex accounting features.

## 2. Key Objectives
- **Personal Use**: targeted for a single user tracking their personal finances.
- **Cross-Platform**: Accessible via Web Browser and Android devices.
- **Data Persistence**: Data must be synced and available across all devices and sessions.
- **Simplicity**: No images or complex media; strictly data (numbers, dates) and text remarks.
- **Currency**: INR (₹) is the sole currency.

## 3. Functional Requirements

### 3.1 User Authentication
- Secure login to ensure data privacy.
- Support for email/password or Google Sign-In.
- Session persistence to avoid frequent logins.

### 3.2 Dashboard
- **Summary Cards**:
  - Total Active Loans (Count).
  - Total Principal Outstanding (₹).
  - Net Interest Received (Year-to-Date).
  - Total Overdue Amount (Principal + Interest).
- **Recent Activity**: List of recent loans created or payments received.

### 3.3 Loan Management (New)
- **Loan List Page**:
  - View all loans as separate cards/entities.
  - Display details: Borrower Name, Principal, Interest Rate (%), Start Date, Status (Active/Closed).
  - Visual indicator for Overdue status.
- **Loan Details Page**:
  - specific view for a single loan.
  - Edit loan details (Principal, Rate, etc.).
  - View repayment history.
  - Add Repayment/Transaction against this loan.
- **Add New Loan Page**:
  - Dedicated form to create a new loan ledger.
  - Fields: 
    - Borrower Name
    - Principal Amount
    - Interest Rate (% per month)
    - Interest Type: Simple (Default) or Compound
    - Payment Frequency: Weekly, Bi-weekly, Monthly (Default), or Floating
    - Start Date
    - Tenure (optional)

### 3.4 Repayment & Transaction Tracking
- Record payments received against specific loans.
- Fields: Date, Amount, Remarks.
- Auto-calculate remaining balance and interest split (if applicable).

### 3.5 People & Search
- Search loans by Borrower Name.
- Filter by Status (Active, Closed, Overdue).

### 3.6 Localization (New)
- **Language**: The entire application interface must be in **Tamil**.
- **Formatting**: Dates should follow the Tamil locale format (`ta-IN`).

### 3.7 Native Integrations (New)
- **Contact Picker**: logic to select a contact from the Android device's address book to autofill the "Borrower Name" field.

## 4. Non-Functional Requirements

### 4.1 Data Persistence & Sync
- **Centralized Database**: Use a real-time cloud database (e.g., Firebase, Supabase) to ensure data is instantly reflected on all devices.
- **Offline Capability**: Basic offline viewing of cached data (optional but recommended for mobile).

### 4.2 User Interface
- **Responsive Design**: optimized for both Desktop Web and Mobile screens.
- **Android App**: Can be delivered as a Progressive Web App (PWA) installable on Android or a wrapped Native app.
- **Aesthetics**: Clean, minimal, data-focused.
- **Language**: **Tamil** is the primary language.

### 4.3 Constraints
- **Currency**: Hardcoded to Indian Rupee (₹).
- **Storage**: No media upload features. Database only stores strings and numbers.
- **Cost**: Zero or Near-Zero operational cost (Free tier cloud services).
- **Platform**: Contact Picker feature is restricted to supported Android browsers (Chrome/Edge) served over HTTPS.

## 5. Potential Tech Stack
- **Frontend**: React.js (Vite) + TailwindCSS.
- **Mobile**: PWA (Installable on Android).
- **Backend/DB**: Firebase (Auth + Firestore) or Supabase.
- **Hosting**: Vercel or Netlify.
