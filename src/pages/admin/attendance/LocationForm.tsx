import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { saveLocation, updateLocation } from '../../../api/officeLocationApi';
 // Adjust path if needed

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowLeft, Save } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface LocationFormData {
  name: string;
  address: string;
  radius: string;
  latitude: string;
  longitude: string;
}

export default function LocationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    radius: '100',
    latitude: '',
    longitude: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCN5ua2SpAFaL1KIX5KSS0IMB0om2dsdQE',
    libraries: ['places']
  });

  const mapContainerStyle = {
    width: '100%',
    height: '300px'
  };

  const defaultCenter = {
    lat: -1.2921,
    lng: 36.8219
  };

  useEffect(() => {
    if (isEditing) {
      // Fetch existing location
      axios.get(`/api/locations/${id}`)
        .then((res) => {
          const data = res.data;
          setFormData({
            name: data.name || '',
            address: data.address || '',
            radius: data.radius?.toString() || '100',
            latitude: data.latitude?.toString() || '',
            longitude: data.longitude?.toString() || ''
          });
        })
        .catch((err) => {
          console.error('Failed to fetch location:', err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setFormData((prev) => ({
            ...prev,
            address: results[0].formatted_address
          }));
        }
      });
    }
  };

  const handleAddressBlur = () => {
    if (formData.address.trim()) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: formData.address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setFormData((prev) => ({
            ...prev,
            latitude: location.lat().toString(),
            longitude: location.lng().toString()
          }));
        } else {
          alert('Address not found. Please try a more specific address.');
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateLocation(id!, {
          ...formData,
          radius: parseInt(formData.radius),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        });
      } else {
        await saveLocation({
          ...formData,
          radius: parseInt(formData.radius),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        });
      }


      navigate('/admin/attendance-settings?tab=locations');
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Location' : 'Add New Location'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update the office location details'
              : 'Add a new office location for attendance tracking'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
          <CardDescription>
            Enter the office location information and set the geofence radius.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius">Geofence Radius (meters) *</Label>
                  <Input
                    id="radius"
                    name="radius"
                    type="number"
                    min="10"
                    value={formData.radius}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleAddressBlur}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Pick Location on Map</Label>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={
                        formData.latitude && formData.longitude
                          ? {
                              lat: parseFloat(formData.latitude),
                              lng: parseFloat(formData.longitude)
                            }
                          : defaultCenter
                      }
                      zoom={14}
                      onClick={handleMapClick}
                    >
                      {formData.latitude && formData.longitude && (
                        <Marker
                          position={{
                            lat: parseFloat(formData.latitude),
                            lng: parseFloat(formData.longitude)
                          }}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <p>Loading map...</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                          3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update Location' : 'Add Location'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
