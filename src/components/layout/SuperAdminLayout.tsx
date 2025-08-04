import React from 'react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Header } from './Header';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function SuperAdminLayout({ children, onLogout }: SuperAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SuperAdminSidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} isSuperAdmin={true} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
