import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/config';

export type Department = {
  id: string;
  name: string;
  description: string;
  headCount: number;
  roles: string[];
};

const API_URL = `${BACKEND_URL}/company-admin/departments`;

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data.map((dept: any) => ({
        id: dept.id.toString(),
        name: dept.name,
        description: dept.description,
        headCount: dept.headCount || 0,
        roles: Array.isArray(dept.roles) ? dept.roles : (dept.roles ? JSON.parse(dept.roles) : [])
      })));
    } catch (err: any) {
      setError(err.message || 'Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line
  }, []);

  return { departments, loading, error, refetch: fetchDepartments };
}
