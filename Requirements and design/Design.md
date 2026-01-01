# System Design - Lend Manager

## 1. High-Level Architecture
The application follows a **Serverless Single-Page Application (SPA)** architecture, delivered as a **Progressive Web App (PWA)**.

- **Client**: React.js (Vite) running in the browser/webview. Handles UI, logic, and offline caching.
- **Backend**: Firebase (Backend-as-a-Service).
  - **Auth**: Manages identity (Email/Password, Google).
  - **Firestore**: NoSQL Database for storing user data (Loans, Repayments).
  - **Hosting**: Serves the static assets.

## 2. Data Model (Firestore Schema)
All data is namespaced under the User ID to ensure privacy.

### Collection: `users`
Document ID: `userId` (from Auth)

#### Sub-collection: `loans`
Represents a single agreement or account with a borrower.
- `id`: string (UUID)
- `borrowerName`: string
- `principal`: number (Original Amount in ₹)
- `interestRate`: number (% per month)
- `interestType`: `'SIMPLE'` | `'COMPOUND'`
- `paymentFrequency`: `'WEEKLY'` | `'BIWEEKLY'` | `'MONTHLY'` | `'FLOATING'`
- `startDate`: timestamp
- `status`: `'ACTIVE'` | `'CLOSED'`
- `createdAt`: timestamp

#### Sub-collection: `loans/{loanId}/repayments`
Represents a transaction/payment made against a specific loan.
- `id`: string (UUID)
- `amount`: number
- `date`: timestamp
- `remarks`: string (Optional note)
- `createdAt`: timestamp

## 3. Component Architecture
Structure of the React application.

### Core Structure
- **App**: Root component, handles Auth State and Routing.
- **Layout**: Main wrapper with Header (Navigation) and Content Area.
- **AuthGuard**: Protects private routes.

### Key Components
- **Dashboard**
  - `SummaryCard`: Reusable card for stats (Active Loans, Outstanding, etc.).
  - `RecentActivity`: List of latest 5 changes.
- **Loan Management**
  - `LoanList`: Grid/List view of `LoanCard`s.
  - `LoanCard`: Displays summary (Name, Due, Status).
  - `LoanForm`: Form to Create or Edit a Loan.
  - `LoanDetails`: Full view of a loan + Repayment History.
- **Repayment**
  - `RepaymentModal`: specific form to add a payment within Loan Details.
- **Integrations**
  - `ContactPicker`: Logic to invoke `navigator.contacts.select` for retrieving borrower names.

## 4. State Management
- **Global Auth State**: React Context (`AuthContext`) to store current user.
- **Data State**: 
  - Real-time listeners (`onSnapshot`) for syncing data.
  - Local state for form inputs and temporary UI interaction.

## 5. Security & Privacy
### Firestore Security Rules
```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
Ensures users can ONLY access their own data.

## 6. UX & Design System
- **Language**: **Tamil** is the primary interface language.
- **Theme**: Clean typography, High contrast for financial data.
- **Mobile First**: Touch-friendly targets, hamburger menu or bottom nav.
- **Indicators**:
  - Green: Payment Received / Active.
  - Red: Overdue / Defaulted.
  - Grey: Closed.
