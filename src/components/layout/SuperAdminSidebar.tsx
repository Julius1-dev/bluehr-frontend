import React from 'react';
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart2, 
  FileText,
  Wallet,
  HelpCircle,
  LogOut,
  UserCog,
  CreditCard as BillingIcon,
  ServerCog,
  ShieldCheck,
  DollarSign,
  Activity,
  Wallet as WalletIcon,
  ClipboardEdit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  onMobileClose?: () => void;
}

function NavItem({ icon, label, to, badge, onMobileClose }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to}
      onClick={onMobileClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
        isActive 
          ? "bg-purple-50 text-purple-700" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <div className="flex-shrink-0 w-5 h-5">
        {icon}
      </div>
      <span>{label}</span>
      {badge && (
        <div className="ml-auto bg-purple-600 text-white text-xs font-semibold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
          {badge}
        </div>
      )}
    </Link>
  );
}

interface SuperAdminSidebarProps {
  onLogout: () => void;
  onMobileClose?: () => void;
}

export function SuperAdminSidebar({ onLogout, onMobileClose }: SuperAdminSidebarProps) {
  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-md flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              BlueHR Super Admin
            </span>
            <span className="text-xs text-gray-500">System Control Panel</span>
          </div>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <NavItem 
          icon={<Home className="w-full h-full" />} 
          label="Dashboard" 
          to="/super-admin" 
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<Building2 className="w-full h-full" />} 
          label="Companies" 
          to="/super-admin/companies" 
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<Users className="w-full h-full" />} 
          label="Users" 
          to="/super-admin/users" 
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<UserCog className="w-full h-full" />} 
          label="Admins" 
          to="/super-admin/sub-admins" 
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<BarChart2 className="w-full h-full" />} 
          label="Analytics" 
          to="/super-admin/analytics" 
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<ClipboardEdit className="w-full h-full" />} 
          label="Adjustments" 
          to="/super-admin/adjustments" 
          onMobileClose={onMobileClose}
        />
        
        <div className="pt-4 mt-2 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Billing</h3>
          <NavItem 
            icon={<BillingIcon className="w-full h-full" />} 
            label="Subscriptions" 
            to="/super-admin/subscriptions" 
            onMobileClose={onMobileClose}
          />
          <NavItem 
            icon={<Wallet className="w-full h-full" />} 
            label="Pricing Plans" 
            to="/super-admin/pricing-plans" 
            onMobileClose={onMobileClose}
          />
          <NavItem 
            icon={<CreditCard className="w-full h-full" />} 
            label="Payments" 
            to="/super-admin/payments" 
            onMobileClose={onMobileClose}
          />
          <NavItem 
            icon={<DollarSign className="w-full h-full" />} 
            label="Advances" 
            to="/super-admin/advances/overview" 
            onMobileClose={onMobileClose}
          />
          <NavItem 
            icon={<WalletIcon className="w-full h-full" />} 
            label="Wallet Management" 
            to="/super-admin/wallet" 
            onMobileClose={onMobileClose}
          />
        </div>
        
        <div className="pt-4 mt-2 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</h3>
          <NavItem icon={<Activity className="w-full h-full" />} label="System Health" to="/super-admin/system-health" onMobileClose={onMobileClose} />
          <NavItem icon={<ServerCog className="w-full h-full" />} label="System Settings" to="/super-admin/system-settings" onMobileClose={onMobileClose} />
          <NavItem icon={<FileText className="w-full h-full" />} label="Audit Logs" to="/super-admin/audit-logs" onMobileClose={onMobileClose} />
        </div>
        
        <div className="pt-4 mt-2 border-t border-gray-200">
          <NavItem icon={<HelpCircle className="w-full h-full" />} label="Help & Support" to="/super-admin/support" onMobileClose={onMobileClose} />
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => {
              console.log('Sidebar logout button clicked');
              onLogout();
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5">
                <LogOut className="w-full h-full" />
              </div>
              <span className="text-sm font-medium">Logout</span>
            </div>
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-800 font-semibold">SA</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Super Admin</p>
            <p className="text-xs text-gray-500">admin@bluehr.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
