import React, { useEffect, useState } from 'react';
import { 
  Home, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  BarChart2, 
  FileText, 
  Settings,
  LogOut,
  Megaphone,
  Building,
  Shield,
  LifeBuoy,
  UserX,
  Building2,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

// First, define the NavItem component before using it in AdminSidebar
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  requiredPermissions?: string[];
  userPermissions?: string[];
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  to, 
  badge, 
  requiredPermissions, 
  userPermissions 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Check if user has required permissions
  const hasPermission = !requiredPermissions || requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => 
      userPermissions?.includes(permission) || userPermissions?.includes('*')
    );

  // Don't render if user doesn't have permission
  if (!hasPermission) {
    return null;
  }

  return (
    <Link 
      to={to}
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
};

// Then define the AdminSidebar component
export const AdminSidebar: React.FC = () => {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Get user profile to check permissions and role
        const response = await fetch('http://localhost:4000/company-admin/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User permissions:', data.data?.permissions);
          // Always grant full access to the original admin
          if (data.data && data.data.role === 'admin') {
            setUserPermissions(['*']); // Admin has all permissions
          } else if (data.data && data.data.permissions) {
            setUserPermissions(data.data.permissions);
          } else {
            setUserPermissions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);

  if (loading) {
    return (
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 flex items-center gap-2 border-b border-gray-200">
          <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-purple-600">BlueHR</span>
            <span className="text-xs text-gray-500">Admin Portal</span>
          </div>
        </div>
        <div className="flex-1 py-4 px-3 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 flex items-center gap-2 border-b border-gray-200">
        <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-purple-600">BlueHR</span>
          <span className="text-xs text-gray-500">Admin Portal</span>
        </div>
      </div>
      
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <NavItem icon={<Home className="w-full h-full" />} label="Dashboard" to="/admin" userPermissions={userPermissions} />
        <NavItem 
          icon={<Users className="w-full h-full" />} 
          label="Team Management" 
          to="/admin/team" 
          requiredPermissions={['manage_users']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<Building2 className="w-full h-full" />} 
          label="Departments" 
          to="/admin/departments" 
          requiredPermissions={['manage_users']}
          userPermissions={userPermissions}
        />
        {/* <NavItem 
          icon={<Fingerprint className="w-full h-full" />} 
          label="Employee Check-In/Out" 
          to="/admin/employee-checkin" 
          requiredPermissions={['manage_attendance']}
          userPermissions={userPermissions}
        /> */}
        <NavItem 
          icon={<Clock className="w-full h-full" />} 
          label="Attendance" 
          to="/admin/attendance" 
          requiredPermissions={['manage_attendance']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<Calendar className="w-full h-full" />} 
          label="Leave Requests" 
          to="/admin/leave-requests" 
          badge={3} 
          requiredPermissions={['manage_leave']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<UserX className="w-full h-full" />} 
          label="Offboarding" 
          to="/admin/offboarding" 
          requiredPermissions={['manage_users']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<CreditCard className="w-full h-full" />} 
          label="Payroll" 
          to="/admin/payroll" 
          requiredPermissions={['manage_payroll']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<BarChart2 className="w-full h-full" />} 
          label="Performance" 
          to="/admin/performance" 
          requiredPermissions={['manage_performance']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<FileText className="w-full h-full" />} 
          label="Documents" 
          to="/admin/documents" 
          requiredPermissions={['manage_documents']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<Megaphone className="w-full h-full" />} 
          label="Announcements" 
          to="/admin/announcements" 
          requiredPermissions={['manage_announcements']}
          userPermissions={userPermissions}
        />
        <NavItem 
          icon={<Building className="w-full h-full" />} 
          label="Company Profile" 
          to="/admin/company-profile" 
          requiredPermissions={['manage_settings']}
          userPermissions={userPermissions}
        />
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <NavItem icon={<LifeBuoy className="w-full h-full" />} label="Help & Support" to="/admin/support" userPermissions={userPermissions} />
          <NavItem 
            icon={<Shield className="w-full h-full" />} 
            label="Roles & Permissions" 
            to="/admin/roles" 
            requiredPermissions={['manage_roles']}
            userPermissions={userPermissions}
          />
          <NavItem icon={<Settings className="w-full h-full" />} label="Settings" to="/admin/settings" userPermissions={userPermissions} />
          <NavItem 
            icon={<CreditCard className="w-full h-full" />} 
            label="Advance Settings" 
            to="/admin/advance-settings" 
            requiredPermissions={['manage_payroll']}
            userPermissions={userPermissions}
          />
          <NavItem icon={<LogOut className="w-full h-full" />} label="Logout" to="/logout" userPermissions={userPermissions} />
        </div>
      </div>
    </aside>
  );
};