# Monthly Budget Limits Feature - Setup Guide

This document explains the new Monthly Budget Limits feature with Real-Time Warnings & Multi-User Household Support.

## 📦 Installation

### Backend Dependencies

```bash
cd backend
npm install socket.io
npm install --save-dev @types/socket.io
```

### Frontend Dependencies

```bash
cd client
npm install socket.io-client zustand
```

## 🗄️ Database Schema Updates

### 1. Household Model
- **Location**: `backend/src/models/household.model.ts`
- **Features**:
  - Supports multiple users (members array)
  - Each member has a role (ADMIN or MEMBER)
  - Stores `monthlyBudgetLimit` in cents
  - First member is automatically ADMIN

### 2. Transaction Model Updates
- **Location**: `backend/src/models/transaction.model.ts`
- **Changes**:
  - Added optional `householdId` field
  - Transactions can now be associated with a household

## 🔌 Backend API Endpoints

All endpoints are prefixed with `/api/budget` and require JWT authentication.

### GET `/api/budget/status/:householdId`
Returns current budget status for a household.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpentThisMonth": 1250.50,
    "budgetLimit": 2000.00,
    "remaining": 749.50,
    "overBudget": false,
    "percentageUsed": 62.53
  }
}
```

### PUT `/api/budget/limit/:householdId`
Updates monthly budget limit (ADMIN only).

**Request Body:**
```json
{
  "monthlyBudgetLimit": 2500.00
}
```

### POST `/api/budget/household/create`
Creates a new household.

**Request Body:**
```json
{
  "name": "My Household",
  "monthlyBudgetLimit": 2000.00
}
```

### POST `/api/budget/household/join`
Joins an existing household.

**Request Body:**
```json
{
  "householdId": "household_id_here"
}
```

### GET `/api/budget/household`
Gets the current user's household.

## 🔔 Real-Time Budget Warnings

### Socket.IO Integration

The backend uses Socket.IO to emit real-time budget warnings when:
- A new expense transaction is created that exceeds the budget
- An existing expense transaction is updated and the budget is exceeded

### Socket Events

**Client → Server:**
- `join-household`: Join a household room (householdId)
- `leave-household`: Leave a household room (householdId)

**Server → Client:**
- `budget-warning`: Emitted when budget is exceeded
  ```json
  {
    "householdId": "household_id",
    "totalSpentThisMonth": 2100.00,
    "budgetLimit": 2000.00,
    "remaining": -100.00,
    "overBudget": true,
    "percentageUsed": 105.00,
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

## 🎨 Frontend Implementation

### Zustand Store
- **Location**: `client/src/stores/budget-store.ts`
- Manages budget state and household information

### Budget Page
- **Location**: `client/src/pages/budget/index.tsx`
- **Route**: `/budget`
- **Features**:
  - Displays current budget status
  - Progress bar with color-coded warnings
  - Real-time updates via Socket.IO
  - Toast notifications when budget is exceeded
  - Admin can edit budget limit

### Socket Hook
- **Location**: `client/src/hooks/use-socket.ts`
- Handles Socket.IO connection and event listeners
- Automatically joins household room when household is loaded

## 🚀 Usage

### 1. Create a Household

When a user first accesses the Budget page, they'll be prompted to create a household. The creator automatically becomes the ADMIN.

### 2. Set Budget Limit

ADMIN users can click "Edit Budget" to set or update the monthly budget limit.

### 3. Track Spending

The Budget page shows:
- Total spent this month
- Budget limit
- Remaining amount
- Progress percentage
- Visual warnings (80%+ = warning, 100%+ = danger)

### 4. Real-Time Warnings

When a transaction causes the budget to be exceeded:
- A toast notification appears immediately
- The budget status updates in real-time
- Visual indicators change to red/danger state

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
FRONTEND_ORIGIN=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

The Socket.IO connection URL is automatically derived from `VITE_API_URL`.

## 📝 Notes

1. **Budget Calculation**: Only counts `EXPENSE` type transactions with `COMPLETED` status for the current month.

2. **Currency Storage**: Budget limits and amounts are stored in cents in the database but displayed in dollars in the UI.

3. **Household Membership**: Users can only belong to one household at a time (can be extended for multiple households).

4. **Admin Permissions**: Only ADMIN members can update the budget limit.

5. **Transaction Association**: When creating a transaction, if `householdId` is not provided, the system automatically uses the user's household.

## 🐛 Troubleshooting

### Socket.IO Connection Issues
- Ensure CORS is properly configured in backend
- Check that `FRONTEND_ORIGIN` matches your frontend URL
- Verify Socket.IO server is running on the correct port

### Budget Not Updating
- Check that transactions have `householdId` set
- Verify transaction type is `EXPENSE`
- Ensure transaction status is `COMPLETED`

### Admin Check Not Working
- Verify user ID format matches between auth and household members
- Check that the user is actually an ADMIN in the household

## 🎯 Future Enhancements

Potential improvements:
- Support for multiple households per user
- Budget categories with individual limits
- Budget history and trends
- Email notifications for budget warnings
- Budget sharing and collaboration features

