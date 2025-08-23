import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Header } from './Header';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  isSuperAdmin?: boolean;
}

export function AdminDashboardLayout({ children, onLogout, isSuperAdmin = false }: AdminDashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {isSuperAdmin 
          ? <SuperAdminSidebar onLogout={onLogout} onMobileClose={closeMobileSidebar} /> 
          : <AdminSidebar onLogout={onLogout} onMobileClose={closeMobileSidebar} />
        }
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onLogout={onLogout} 
          isAdmin={true} 
          isSuperAdmin={isSuperAdmin} 
          onMobileMenuToggle={toggleMobileSidebar}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

