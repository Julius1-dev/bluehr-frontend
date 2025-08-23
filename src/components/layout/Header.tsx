import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface HeaderProps {
  onLogout: () => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Header({ onLogout, isAdmin = false, isSuperAdmin = false, onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onMobileMenuToggle}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 mr-4 md:hidden">
        <div className={`h-8 w-8 ${isSuperAdmin ? 'bg-red-600' : isAdmin ? 'bg-purple-600' : 'bg-blue-600'} rounded-md flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <div className="flex flex-col">
          <span className={`font-semibold ${isSuperAdmin ? 'text-red-600' : isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
            BlueHR
          </span>
          <span className="text-xs text-gray-500">
            {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Portal' : 'Employee Portal'}
          </span>
        </div>
      </div>
      {/* <div className="flex items-center ml-auto gap-3 md:gap-4">
        <NotificationDropdown />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Logout
        </Button>
      </div> */}
    </header>
  );
}

