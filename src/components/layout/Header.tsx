import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface HeaderProps {
  onLogout: () => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export function Header({ onLogout, isAdmin = false, isSuperAdmin = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
      <div className="md:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
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
      <div className="flex items-center ml-auto gap-3 md:gap-4">
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}