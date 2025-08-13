import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from './lib/config';

// Lazy load components for better performance
const AdvancesOverview = lazy(() => import('./pages/super-admin/advances/AdvancesOverview'));
const AdvanceRequests = lazy(() => import('./pages/super-admin/advances/AdvanceRequests'));
const AdvanceSettings = lazy(() => import('./pages/super-admin/advances/AdvanceSettings'));
const CompanyAdvances = lazy(() => import('./pages/super-admin/advances/CompanyAdvances'));
const SystemHealth = lazy(() => import('./pages/super-admin/SystemHealth'));
const SystemSettings = lazy(() => import('./pages/super-admin/settings/SystemSettings'));
const AuditLogs = lazy(() => import('./pages/super-admin/AuditLogs'));
const WalletManagement = lazy(() => import('./pages/super-admin/wallet/WalletManagement'));
// const HelpAndSupport = lazy(() => import('./pages/HelpAndSupport'));
import { EmployeeHelpAndSupport, AdminHelpAndSupport, SuperAdminHelpAndSupport } from './pages/HelpAndSupport';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboardLayout } from './components/layout/AdminDashboardLayout';

// Auth Components
import { PermissionGuard } from './components/auth/PermissionGuard';

// Pages
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Settings } from './pages/Settings';
import { EmployeeSettings } from './pages/EmployeeSettings';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { AddCompanyPage } from './pages/super-admin/AddCompanyPage';
import { CompanyDetails } from './pages/super-admin/CompanyDetails';
import { UsersManagement } from './pages/super-admin/UsersManagement';
import { AddUserPage } from './pages/super-admin/AddUserPage';
import { UserProfile } from './pages/super-admin/UserProfile';
import { EditUser } from './pages/super-admin/EditUser';
import { SubAdminManagement } from './pages/super-admin/SubAdminManagement';
import AnalyticsPage from './pages/super-admin/AnalyticsPage';
import AdjustmentsPage from './pages/super-admin/adjustments/AdjustmentsPage';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { TimeAndAttendance } from './pages/TimeAndAttendance';
import { Leave } from './pages/Leave';
import { RequestLeave } from './pages/RequestLeave';
import { Payroll } from './pages/Payroll';
import { PayrollManagement } from "./pages/admin/PayrollManagement";
import { PayrollReports } from "./pages/admin/PayrollReports";
import AdvanceSettingsPage from "./pages/admin/AdvanceSettings";
import { WalletPage } from './pages/Wallet';
import { AdvanceStatementPage } from './pages/AdvanceStatement';
import { SavingsAccount } from './pages/SavingsAccount';
import { WithdrawMpesa } from './pages/WithdrawMpesa';
import { TransferToBank } from './pages/TransferToBank';
import PerformancePage from './pages/admin/performance';
import { Performance as EmployeePerformance } from './pages/Performance';
import { UpdateGoalProgress } from './pages/UpdateGoalProgress';
import { Documents } from './pages/Documents';
import { CompanyProfile } from './pages/admin/CompanyProfile';
import { Announcements } from './pages/admin/Announcements';
import RolesAndPermissions from './pages/admin/RolesAndPermissions';
import { DepartmentsPage } from './pages/admin/Departments';
import { AddEmployeePage } from './pages/admin/AddEmployee';
import ViewSchedule from './pages/admin/ViewSchedule';
import ChangeDepartment from './pages/admin/ChangeDepartment';
import AttendanceSettings from './pages/admin/attendance/AttendanceSettings';
import LocationForm from './pages/admin/attendance/LocationForm';
import AttendanceAnalytics from './pages/admin/attendance/Analytics';
import { TeamManagement } from './pages/admin/TeamManagement';
import { AttendanceManagement } from './pages/admin/AttendanceManagement';
import EmployeeCheckInOut from './pages/EmployeeCheckInOut';
import { LeaveManagement } from './pages/admin/LeaveManagement';
import SubscriptionsPage from './pages/super-admin/SubscriptionsPage';
import PricingPlansPage from './pages/super-admin/PricingPlansPage';
import PaymentsPage from './pages/super-admin/PaymentsPage';
import AdvancesPage from './pages/super-admin/AdvancesPage';
import { Team } from './pages/Team';
import { SetNewGoal } from './pages/SetNewGoal';
import { AdminPage } from './pages/Admin';
import { Holidays } from './pages/Holidays';
import OffboardingManagement from './pages/admin/OffboardingManagement';
import OffboardingRequest from './pages/OffboardingRequest';
import Companies from './pages/super-admin/Companies';
import Admins from './pages/super-admin/Admins';
import AmendPlan from './pages/super-admin/AmendPlan';
import ViewEmployee from './pages/admin/ViewEmployee';
import ImportPreview from './pages/admin/ImportPreview';
import AssignGoal from './pages/admin/performance/AssignGoal';
import LeaveTypes from './pages/admin/leave';
import LeaveCalendar from './pages/admin/leave/LeaveCalendar';
import PrepareReviewPage from './pages/admin/performance/prepare-review';
import ThreeSixtyFeedbackPage from './pages/admin/performance/360-feedback';
import GoogleCallback from './pages/GoogleCallback';

// Components


// Types for user roles
type UserRole = 'employee' | 'admin' | 'superadmin';

const AppRoutes = () => {
  // Start unauthenticated to show sign-in page first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('employee');

  // Derived state for role checks
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';

  const navigate = useNavigate();

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role as UserRole);
    localStorage.setItem('userRole', role);
  };

  useEffect(() => {
    // Comment out auto-login for now to force sign-in page
    // const storedRole = localStorage.getItem('userRole') as UserRole | null;
    // if (storedRole) {
    //   setIsAuthenticated(true);
    //   setUserRole(storedRole);
    // }
  }, []);

  const handleLogout = async () => {
    console.log('Logout initiated');
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Calling backend logout endpoint');
        await fetch(`${BACKEND_URL}/super-admin/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Backend logout successful');
      }
    } catch (err) {
      console.log('Backend logout error:', err);
      // Ignore errors, proceed with logout
    }
    console.log('Clearing local state and storage');
    setIsAuthenticated(false);
    setUserRole('employee');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    console.log('Navigating to signin page');
    navigate('/signin', { replace: true });
  };



  // Redirect to the appropriate dashboard based on user role
  const getDashboardRedirect = () => {
    if (isSuperAdmin) return "/super-admin";
    if (isAdmin) return "/admin";
    return "/";
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={
          !isAuthenticated ? (
            <SignIn onLogin={handleLogin} />
          ) : (
            <Navigate to={getDashboardRedirect()} replace />
          )
        } />
        <Route path="/signup" element={
          !isAuthenticated ? (
            <SignUp onSignUp={handleLogin} />
          ) : (
            <Navigate to={getDashboardRedirect()} replace />
          )
        } />
        <Route path="/forgot-password" element={
          !isAuthenticated ? (
            <ForgotPassword />
          ) : (
            <Navigate to={getDashboardRedirect()} replace />
          )
        } />

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          isAuthenticated && isSuperAdmin ? (
            <AdminDashboardLayout onLogout={handleLogout} isSuperAdmin={true}>
              <Outlet />
            </AdminDashboardLayout>
          ) : (
            <Navigate to="/signin" replace />
          )
        }>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/add" element={<AddCompanyPage />} />
          <Route path="companies/:companyId" element={<CompanyDetails />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="users/add" element={<AddUserPage />} />
          <Route path="users/:id" element={<UserProfile />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="sub-admins" element={<Admins />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="adjustments" element={<AdjustmentsPage />} />
          <Route 
            path="system-health" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <SystemHealth />
              </Suspense>
            } 
          />
          <Route path="system-settings" element={
            <Suspense fallback={<div>Loading...</div>}>
              <SystemSettings />
            </Suspense>
          } />
          <Route path="audit-logs" element={
            <Suspense fallback={<div>Loading...</div>}>
              <AuditLogs />
            </Suspense>
          } />
          <Route path="support" element={
            <Suspense fallback={<div>Loading...</div>}>
              <SuperAdminHelpAndSupport />
            </Suspense>
          } />
         
          {/* Subscriptions Routes */}
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          {/* Pricing Plans Route */}
          <Route path="pricing-plans" element={<PricingPlansPage />} />
          {/* Payments Route */}
          <Route path="payments" element={<PaymentsPage />} />
          {/* Wallet Management */}
          <Route path="wallet" element={
            <Suspense fallback={<div>Loading...</div>}>
              <WalletManagement />
            </Suspense>
          } />
          {/* Advances Routes */}
          <Route path="advances" element={<AdvancesPage />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route 
              path="overview" 
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdvancesOverview />
                </Suspense>
              } 
            />
            <Route 
              path="requests" 
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdvanceRequests />
                </Suspense>
              } 
            />
            <Route 
              path="settings" 
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdvanceSettings />
                </Suspense>
              } 
            />
            <Route 
              path=":companyId" 
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <CompanyAdvances />
                </Suspense>
              } 
            />
          </Route>
          <Route path="amend-plan/:id" element={<AmendPlan />} />
        </Route>

        {/* Admin Routes */}
        <Route element={
          isAuthenticated && isAdmin && !isSuperAdmin ? (
            <AdminDashboardLayout onLogout={handleLogout} isSuperAdmin={false}>
              <Outlet />
            </AdminDashboardLayout>
          ) : (
            <Navigate to="/signin" replace />
          )
        }>
          {/* All /admin pages */}
          {/* <Route path="/admin/employee-checkin" element={
            <PermissionGuard requiredPermissions={['manage_attendance']}>
              <EmployeeCheckInOut />
            </PermissionGuard>
          } /> */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/team" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <TeamManagement />
            </PermissionGuard>
          } />
          <Route path="/admin/team/add" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <AddEmployeePage />
            </PermissionGuard>
          } />
          <Route path="/admin/team/edit/:id" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <AddEmployeePage isEditMode={true} />
            </PermissionGuard>
          } />
          <Route path="/admin/team/:id/department" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <ChangeDepartment />
            </PermissionGuard>
          } />
          <Route path="/admin/team/:id/schedule" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <ViewSchedule />
            </PermissionGuard>
          } />
          <Route path="/admin/attendance" element={
            <PermissionGuard requiredPermissions={['manage_attendance']}>
              <AttendanceManagement />
            </PermissionGuard>
          } />
          <Route path="/admin/attendance-settings" element={
            <PermissionGuard requiredPermissions={['manage_attendance']}>
              <AttendanceSettings />
            </PermissionGuard>
          } />
          <Route path="/admin/attendance/locations/new" element={
            <PermissionGuard requiredPermissions={['manage_attendance']}>
              <LocationForm />
            </PermissionGuard>
          } />
          <Route path="/admin/attendance/locations/:id" element={
            <PermissionGuard requiredPermissions={['manage_attendance']}>
              <LocationForm />
            </PermissionGuard>
          } />
          <Route path="/admin/attendance/analytics" element={
            <PermissionGuard requiredPermissions={['manage_attendance', 'view_reports']}>
              <AttendanceAnalytics />
            </PermissionGuard>
          } />
          <Route path="/admin/leave-requests" element={
            <PermissionGuard requiredPermissions={['manage_leave']}>
              <LeaveManagement />
            </PermissionGuard>
          } />
          <Route path="/admin/payroll" element={
            <PermissionGuard requiredPermissions={['manage_payroll']}>
              <PayrollManagement />
            </PermissionGuard>
          } />
          <Route path="/admin/payroll-reports" element={
            <PermissionGuard requiredPermissions={['manage_payroll', 'view_reports']}>
              <PayrollReports />
            </PermissionGuard>
          } />
          <Route path="/admin/advance-settings" element={
            <PermissionGuard requiredPermissions={['manage_payroll']}>
              <AdvanceSettingsPage />
            </PermissionGuard>
          } />
          <Route path="/admin/performance" element={
            <PermissionGuard requiredPermissions={['manage_performance']}>
              <PerformancePage />
            </PermissionGuard>
          } />
          <Route path="/admin/performance/assign-goal" element={
            <PermissionGuard requiredPermissions={['manage_performance']}>
              <AssignGoal />
            </PermissionGuard>
          } />
          <Route path="/admin/performance/prepare-review" element={
            <PermissionGuard requiredPermissions={['manage_performance']}>
              <PrepareReviewPage />
            </PermissionGuard>
          } />
          <Route path="/admin/performance/360-feedback" element={
            <PermissionGuard requiredPermissions={['manage_performance']}>
              <ThreeSixtyFeedbackPage />
            </PermissionGuard>
          } />
          <Route path="/admin/company-profile" element={
            <PermissionGuard requiredPermissions={['manage_settings']}>
              <CompanyProfile />
            </PermissionGuard>
          } />
          <Route path="/admin/announcements" element={
            <PermissionGuard requiredPermissions={['manage_announcements']}>
              <Announcements />
            </PermissionGuard>
          } />
          <Route path="/admin/roles-permissions" element={
            <PermissionGuard requiredPermissions={['manage_roles']}>
              <RolesAndPermissions />
            </PermissionGuard>
          } />
          <Route path="/admin/departments" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <DepartmentsPage />
            </PermissionGuard>
          } />
          <Route path="/admin/roles" element={
            <PermissionGuard requiredPermissions={['manage_roles']}>
              <RolesAndPermissions />
            </PermissionGuard>
          } />
          <Route path="/admin/offboarding" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <OffboardingManagement />
            </PermissionGuard>
          } />
          <Route path="/admin/documents" element={
            <PermissionGuard requiredPermissions={['manage_documents']}>
              <Documents />
            </PermissionGuard>
          } />
          <Route path="/admin/support" element={<AdminHelpAndSupport />} />
          <Route path="/admin/settings" element={<Settings onLogout={handleLogout} />} />
          <Route path="/admin/team/view/:id" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <ViewEmployee />
            </PermissionGuard>
          } />
          <Route path="/admin/team/import/preview" element={
            <PermissionGuard requiredPermissions={['manage_users']}>
              <ImportPreview />
            </PermissionGuard>
          } />
          <Route path="/admin/leave-policies" element={
            <PermissionGuard requiredPermissions={['manage_leave']}>
              <LeaveTypes />
            </PermissionGuard>
          } />
          <Route path="/admin/leave-calendar" element={
            <PermissionGuard requiredPermissions={['manage_leave']}>
              <LeaveCalendar />
            </PermissionGuard>
          } />
        </Route>



        {/* Employee Routes */}
        <Route element={
          isAuthenticated && userRole === 'employee' ? (
            <DashboardLayout onLogout={handleLogout}>
              <Outlet />
            </DashboardLayout>
          ) : (
            <Navigate to="/signin" replace />
          )
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="time-attendance" element={<TimeAndAttendance />} />
          <Route path="employee-checkin" element={<EmployeeCheckInOut />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/request-leave" element={<RequestLeave />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/advance-statement" element={<AdvanceStatementPage />} />
          <Route path="/savings-account" element={<SavingsAccount />} />
          <Route path="/withdraw-mpesa" element={<WithdrawMpesa />} />
          <Route path="/transfer-to-bank" element={<TransferToBank />} />
          <Route path="/performance" element={<EmployeePerformance />} />
          <Route path="/set-new-goal" element={<SetNewGoal />} />
          <Route path="/update-goal-progress" element={<UpdateGoalProgress />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/team" element={<Team />} />
          <Route path="/holidays" element={<Holidays />} />
          <Route path="/offboarding-request" element={<OffboardingRequest />} />
          <Route path="/support" element={<EmployeeHelpAndSupport />} />
          <Route path="/settings" element={<EmployeeSettings onLogout={handleLogout} />} />
          {/* <Route path="/admin/employee-checkin" element={
            <PermissionGuard requiredPermissions={['manage_attendance']}>
              <EmployeeCheckInOut />
            </PermissionGuard>
          } /> */}
        </Route>

        {/* Google OAuth callback route */}
        <Route path="/auth/callback" element={<GoogleCallback onLogin={handleLogin} />} />

        {/* Fallback route */}
        <Route path="*" element={
          isAuthenticated ? (
            isSuperAdmin ? (
              <Navigate to="/super-admin" replace />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;