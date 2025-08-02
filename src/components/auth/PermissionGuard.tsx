import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BACKEND_URL } from '@/lib/config';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermissions, 
  fallback 
}) => {
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

        // Get user profile to check permissions
        const response = await fetch(`${BACKEND_URL}/company-admin/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Check if user has permissions field
          if (data.data && data.data.permissions) {
            setUserPermissions(data.data.permissions);
          } else {
            // If no permissions field, check if user is admin (full access)
            if (data.data && data.data.role === 'admin') {
              setUserPermissions(['*']); // Admin has all permissions
            } else {
              setUserPermissions([]);
            }
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
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  // Check if user has required permissions
  const hasPermission = requiredPermissions.every(permission => 
    userPermissions.includes(permission) || userPermissions.includes('*')
  );

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};