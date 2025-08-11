import axios from 'axios';
import type { OfficeLocationData } from '@/types'; 
import { BACKEND_URL } from '@/lib/config';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/company-admin/office-location`,
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Convert response to match shared type structure (especially `id: string`)
export const getLocations = async (): Promise<OfficeLocationData[]> => {
  const response = await axiosInstance.get('/');
  const data = Array.isArray(response.data) ? response.data : [];

  return data.map((loc: any) => ({
    id: String(loc.id), // ✅ Force to string
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    address: loc.address || '',
    radius: loc.radius,
  }));
};

export const saveLocation = async (
  data: Omit<OfficeLocationData, 'id'> // ✅ Since new ones don't have an id
): Promise<OfficeLocationData> => {
  const response = await axiosInstance.post('/', data);
  const loc = response.data;
  return {
    id: String(loc.id),
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    address: loc.address || '',
    radius: loc.radius,
  };
};

export const updateLocation = async (
  id: string,
  data: Partial<Omit<OfficeLocationData, 'id'>>
): Promise<OfficeLocationData> => {
  const response = await axiosInstance.put(`/${id}`, data);
  const loc = response.data;
  return {
    id: String(loc.id),
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    address: loc.address || '',
    radius: loc.radius,
  };
};

export const deleteLocation = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/${id}`);
};
