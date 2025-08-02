# BlueHR - Modern HR Management System

BlueHR is a comprehensive Human Resource Management System (HRMS) with three distinct dashboards for different user roles: Super Admin, Admin, and Employee. The application is built with React, TypeScript, and modern web technologies.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Dashboard Overview](#-dashboard-overview)
  - [Super Admin Dashboard](#super-admin-dashboard)
  - [Admin Dashboard](#admin-dashboard)
  - [Employee Dashboard](#employee-dashboard)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Authentication](#-authentication)
- [Development](#-development)
- [Deployment](#-deployment)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone [repository-url]
   cd BlueHR-Frontend-v2
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📊 Dashboard Overview

### Super Admin Dashboard
**Access:** `/super-admin`

**Features:**
- Company Management
  - View all companies
  - Add/Edit company details
  - View company analytics
- User Management
  - Manage all users across companies
  - Assign roles and permissions
- System Settings
  - Configure application settings
  - Manage system health
- Advance Management
  - View and manage advance requests
  - Configure advance settings
- Subscriptions & Billing
  - Manage subscription plans
  - View payment history

### Admin Dashboard
**Access:** `/admin`

**Features:**
- Team Management
  - View and manage team members
  - Add/Edit employee details
  - Change employee departments
- Leave Management
  - Approve/Reject leave requests
  - View team leave calendar
- Attendance Management
  - Track employee attendance
  - Generate attendance reports
- Payroll Management
  - Process payroll
  - View payroll history
- Document Management
  - Upload and share documents
  - Manage document access
- Company Profile
  - Update company information
  - Manage company policies

### Employee Dashboard
**Access:** `/` (root)

**Features:**
- Personal Dashboard
  - View upcoming events
  - Check leave balance
  - Quick access to important documents
- Time & Attendance
  - Clock in/out
  - View attendance history
- Leave Management
  - Request time off
  - Track leave status
- Documents
  - View shared documents
  - Access company policies
- Team Directory
  - View team members
  - Contact information
- Performance
  - Set and track goals
  - View performance reviews

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   ├── ui/              # UI components (buttons, inputs, etc.)
│   └── ...
├── pages/              # Page components
│   ├── admin/           # Admin pages
│   ├── super-admin/     # Super Admin pages
│   └── ...              # Employee pages
├── lib/                 # Utility functions
├── mocks/               # Mock data
├── providers/           # Context providers
└── types/               # TypeScript type definitions
```

## ✨ Features

### Authentication & Authorization
- Role-based access control (Super Admin, Admin, Employee)
- Secure login/logout
- Protected routes

### Document Management
- Upload and share documents
- Set document access levels (view/edit)
- Categorize documents
- Search and filter functionality

### Leave Management
- Request and track leave
- Leave approval workflow
- Leave balance tracking
- Team leave calendar

### Attendance & Time Tracking
- Clock in/out functionality
- Attendance reports
- Timesheet management

### Team Management
- Employee directory
- Department management
- Role-based access control

## 🔒 Authentication

The application uses JWT-based authentication. To access protected routes, users must be authenticated with the appropriate role.

**Available Roles:**
- `superadmin`: Full system access
- `admin`: Company-level administrative access
- `employee`: Standard employee access

## 🛠 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=your_api_url_here
VITE_APP_TITLE=BlueHR
```

## 🚀 Deployment

The application can be deployed to any static hosting service (Vercel, Netlify, etc.) or served from any web server.

### Building for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by BlueHR Team
