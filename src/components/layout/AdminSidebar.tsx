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
import { BACKEND_URL } from '@/lib/config';

// First, define the NavItem component before using it in AdminSidebar
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  requiredPermissions?: string[];
  userPermissions?: string[];
  onMobileClose?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  to, 
  badge, 
  requiredPermissions, 
  userPermissions,
  onMobileClose
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
};

// Then define the AdminSidebar component
export const AdminSidebar: React.FC<{ onLogout: () => void; onMobileClose?: () => void }> = ({ onLogout, onMobileClose }) => {

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Get user profile to check permissions and role
        const response = await fetch(`${BACKEND_URL}/company-admin/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
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

    const fetchPendingLeaveCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // Fetch all leave requests
        const response = await fetch(`${BACKEND_URL}/company-admin/leave-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Count pending requests
          const leaveRequests = data.leaveRequests || [];
          const pendingCount = leaveRequests.filter((req: any) => req.status === 'pending').length;
          setPendingLeaveCount(pendingCount);
        }
      } catch (error) {
        console.error('Error fetching pending leave requests:', error);
        setPendingLeaveCount(0);
      }
    };

    fetchUserPermissions();
    fetchPendingLeaveCount();
  }, []);

  if (loading) {
    return (
      <aside className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-purple-600">BlueHR</span>
              <span className="text-xs text-gray-500">Admin Portal</span>
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
        <div className="flex-1 py-4 px-3 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-purple-600">BlueHR</span>
            <span className="text-xs text-gray-500">Admin Portal</span>
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
        <NavItem icon={<Home className="w-full h-full" />} label="Dashboard" to="/admin" userPermissions={userPermissions} onMobileClose={onMobileClose} />
        <NavItem 
          icon={<Users className="w-full h-full" />} 
          label="Team Management" 
          to="/admin/team" 
          requiredPermissions={['manage_users']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<Building2 className="w-full h-full" />} 
          label="Departments" 
          to="/admin/departments" 
          requiredPermissions={['manage_users']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
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
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<Calendar className="w-full h-full" />} 
          label="Leave Requests" 
          to="/admin/leave-requests" 
          badge={pendingLeaveCount > 0 ? pendingLeaveCount : undefined} 
          requiredPermissions={['manage_leave']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<UserX className="w-full h-full" />} 
          label="Offboarding" 
          to="/admin/offboarding" 
          requiredPermissions={['manage_users']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<CreditCard className="w-full h-full" />} 
          label="Payroll" 
          to="/admin/payroll" 
          requiredPermissions={['manage_payroll']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<BarChart2 className="w-full h-full" />} 
          label="Performance" 
          to="/admin/performance" 
          requiredPermissions={['manage_performance']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<FileText className="w-full h-full" />} 
          label="Documents" 
          to="/admin/documents" 
          requiredPermissions={['manage_documents']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<Megaphone className="w-full h-full" />} 
          label="Announcements" 
          to="/admin/announcements" 
          requiredPermissions={['manage_announcements']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        <NavItem 
          icon={<Building className="w-full h-full" />} 
          label="Company Profile" 
          to="/admin/company-profile" 
          requiredPermissions={['manage_settings']}
          userPermissions={userPermissions}
          onMobileClose={onMobileClose}
        />
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <NavItem icon={<LifeBuoy className="w-full h-full" />} label="Help & Support" to="/admin/support" userPermissions={userPermissions} onMobileClose={onMobileClose} />
          <NavItem 
            icon={<Shield className="w-full h-full" />} 
            label="Roles & Permissions" 
            to="/admin/roles" 
            requiredPermissions={['manage_roles']}
            userPermissions={userPermissions}
            onMobileClose={onMobileClose}
          />
          <NavItem icon={<Settings className="w-full h-full" />} label="Settings" to="/admin/settings" userPermissions={userPermissions} onMobileClose={onMobileClose} />
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
};