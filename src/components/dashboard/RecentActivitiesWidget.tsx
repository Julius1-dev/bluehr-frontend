import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { 
  Clock, 
  Calendar, 
  UserPlus, 
  FileText, 
  DollarSign, 
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function RecentActivitiesWidget() {
  // Mock activities data
  const activities = [
    { 
      id: 1, 
      type: 'leave_approved', 
      user: 'You', 
      target: 'Aisha Patel',
      targetAvatar: '/avatars/aisha.jpg',
      details: 'approved leave request for June 10-15',
      time: '10 minutes ago' 
    },
    { 
      id: 2, 
      type: 'employee_onboarded', 
      user: 'Emma Wilson', 
      userAvatar: '/avatars/emma.jpg',
      details: 'completed onboarding for new hire James Wilson',
      time: '1 hour ago' 
    },
    { 
      id: 3, 
      type: 'payroll_processed', 
      user: 'You', 
      details: 'processed monthly payroll for 24 employees',
      time: '3 hours ago' 
    },
    { 
      id: 4, 
      type: 'attendance_issue', 
      user: 'System', 
      target: 'Michael Chen',
      targetAvatar: '/avatars/michael.jpg',
      details: 'flagged late arrival (10:15 AM)',
      time: '5 hours ago' 
    },
    { 
      id: 5, 
      type: 'document_uploaded', 
      user: 'David Kim', 
      userAvatar: '/avatars/david.jpg',
      details: 'uploaded new expense report for approval',
      time: '1 day ago' 
    },
    { 
      id: 6, 
      type: 'leave_rejected', 
      user: 'You', 
      target: 'Sarah Johnson',
      targetAvatar: '/avatars/sarah.jpg',
      details: 'rejected leave request for July 1-5',
      time: '1 day ago' 
    },
    { 
      id: 7, 
      type: 'policy_updated', 
      user: 'You', 
      details: 'updated remote work policy document',
      time: '2 days ago' 
    }
  ];
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'leave_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'leave_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'employee_onboarded':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'payroll_processed':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'attendance_issue':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'document_uploaded':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'policy_updated':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activities</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  {activity.userAvatar ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.userAvatar} alt={activity.user} />
                      <AvatarFallback>{activity.user[0]}</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <span className="text-sm font-medium">{activity.user}</span>
                  
                  <span className="text-sm text-gray-600">{activity.details}</span>
                  
                  {activity.target ? (
                    <>
                      <span className="text-sm text-gray-600">for</span>
                      {activity.targetAvatar ? (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={activity.targetAvatar} alt={activity.target} />
                          <AvatarFallback>{activity.target[0]}</AvatarFallback>
                        </Avatar>
                      ) : null}
                      <span className="text-sm font-medium">{activity.target}</span>
                    </>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
