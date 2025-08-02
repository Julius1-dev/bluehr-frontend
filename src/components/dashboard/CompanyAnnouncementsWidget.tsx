import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Megaphone, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';

export function CompanyAnnouncementsWidget() {
  const navigate = useNavigate();
  
  // Real announcements data state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No auth token');
        
        const res = await fetch('http://localhost:4000/company-admin/announcements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch announcements');
        
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.announcements || []);
        } else {
          throw new Error(data.message || 'Failed to fetch announcements');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load announcements');
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);
  
  const getCategoryBadge = (type: string) => {
    switch(type) {
      case 'general': 
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">General</Badge>;
      case 'policy': 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Policy</Badge>;
      case 'urgent': 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Urgent</Badge>;
      default: 
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{type}</Badge>;
    }
  };
  
  const getPriorityIndicator = (isPinned: boolean) => {
    if (isPinned) {
      return <div className="h-2 w-2 rounded-full bg-red-500"></div>;
    }
    return <div className="h-2 w-2 rounded-full bg-gray-300"></div>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Company Announcements</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/announcements')}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading announcements...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : announcements.length > 0 ? (
            announcements.slice(0, 3).map(announcement => (
              <div key={announcement.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIndicator(announcement.is_pinned)}
                    <h3 className="text-sm font-medium">{announcement.title}</h3>
                  </div>
                  {getCategoryBadge(announcement.type)}
                </div>
                
                <p className="text-sm text-gray-600">{announcement.content}</p>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Posted: {new Date(announcement.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">By: {announcement.author}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No announcements available</div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/announcements')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Announcement
        </Button>
      </CardFooter>
    </Card>
  );
}
