# Shuttering / Construction Equipment Rental Store

Full-stack rental management system for a shuttering and construction equipment shop.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

## Features

- No authentication required
- Dashboard with key business stats
- Customer listing and customer detail rental history
- Inventory cards with available and rented stock
- Rental creation flow
- Partial returns with separate return history entries
- Automatic bill calculation with paid/unpaid balance tracking
- Responsive modern UI with sidebar navigation

## Folder Structure

```text
backend/
frontend/
README.md
```

## Run Locally

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

Optional fresh seed:

```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## MongoDB

Make sure MongoDB is running locally and the connection string in `backend/.env` matches your setup:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/construction-rental-store
```

## Core Billing Logic

- Rental bill = `quantity x pricePerDay x totalDays`
- Each partial return is stored separately in `returns[]`
- Returned quantity is billed from `issueDate` to that return's `returnDate`
- Remaining unreturned quantity continues accruing until the current date
- UI shows:
  - Total bill
  - Amount paid
  - Remaining amount
  - Paid/unpaid status
# Rental Management System

## Backend setup

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/shuttering-store
ADMIN_TOKEN=baba-deep-singh-admin-token
```

Install/run:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Admin login:

```text
username: admin
password: 12345
```

## Frontend setup

Optional `.env` in `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
cd frontend
npm install
npm run dev
```

Public users see the customer view. Admin login opens the protected dashboard.
