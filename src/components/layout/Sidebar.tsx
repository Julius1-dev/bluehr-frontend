import React, { useEffect, useState } from 'react';
import { 
  Home, 
  Clock, 
  Calendar, 
  CreditCard, 
  BarChart2, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Wallet,
  LifeBuoy,
  UserX,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { employeeLeaveApi } from '@/services/employeeLeaveApi';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

function NavItem({ icon, label, to, badge }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
        isActive 
          ? "bg-blue-50 text-blue-700" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <div className="flex-shrink-0 w-5 h-5">
        {icon}
      </div>
      <span>{label}</span>
      {badge && (
        <div className="ml-auto bg-blue-600 text-white text-xs font-semibold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
          {badge}
        </div>
      )}
    </Link>
  );
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [upcomingLeave, setUpcomingLeave] = useState<any>(null);

  useEffect(() => {
    async function fetchUpcomingLeave() {
      try {
        const response = await employeeLeaveApi.getUpcomingLeave();
        setUpcomingLeave(response.upcomingLeave || null);
      } catch {
        setUpcomingLeave(null);
      }
    }
    fetchUpcomingLeave();
  }, []);

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-semibold text-blue-600">BlueHR</span>
        </div>
        {/* Close button for mobile */}
  {/* Mobile close button removed: onMobileClose is not defined here */}
      </div>
      
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
  <NavItem icon={<Home className="w-full h-full" />} label="Dashboard" to="/" />
  <NavItem icon={<Clock className="w-full h-full" />} label="Time & Attendance" to="/time-attendance" />
        {/* Add the Employee Check-In/Out NavItem here */}
        {/* <NavItem 
          icon={<Fingerprint className="w-full h-full" />} 
          label="Check-In/Out" 
          to="/employee-checkin" 
        /> */}
  <NavItem icon={<Calendar className="w-full h-full" />} label="Leave" to="/leave" badge={upcomingLeave ? 1 : undefined} />
        <NavItem icon={<CreditCard className="w-full h-full" />} label="Payroll" to="/payroll" />
        <NavItem icon={<Wallet className="w-full h-full" />} label="Advances" to="/wallet" />
        <NavItem icon={<BarChart2 className="w-full h-full" />} label="Performance" to="/performance" />
        <NavItem icon={<FileText className="w-full h-full" />} label="Documents" to="/documents" />
        <NavItem icon={<Users className="w-full h-full" />} label="Team" to="/team" />
        <NavItem icon={<UserX className="w-full h-full" />} label="Offboarding Request" to="/offboarding-request" />
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <NavItem icon={<LifeBuoy className="w-full h-full" />} label="Help & Support" to="/support" />
          <NavItem icon={<Settings className="w-full h-full" />} label="Settings" to="/settings" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <div className="flex-shrink-0 w-5 h-5">
              <LogOut className="w-full h-full" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}