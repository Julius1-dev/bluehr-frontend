import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Header } from './Header';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  isSuperAdmin?: boolean;
}

export function AdminDashboardLayout({ children, onLogout, isSuperAdmin = false }: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isSuperAdmin 
        ? <SuperAdminSidebar onLogout={onLogout} /> 
        : <AdminSidebar onLogout={onLogout} />  // ✅ Add this
      }
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} isAdmin={true} isSuperAdmin={isSuperAdmin} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

