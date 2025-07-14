import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeeLeaveApi } from '@/services/employeeLeaveApi';

interface LeaveType {
  id: number;
  name: string;
  days: number;
  color: string;
  description: string;
}

interface LeaveBalance {
  id: number;
  type: string;
  used: number;
  total: number;
  remaining: number;
  color: string;
  description: string;
}

export function RequestLeave() {
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch leave types and balances
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [typesResponse, balancesResponse] = await Promise.all([
          employeeLeaveApi.getAvailableLeaveTypes(),
          employeeLeaveApi.getLeaveBalances()
        ]);

        setLeaveTypes(typesResponse.leaveTypes || []);
        setLeaveBalances(balancesResponse.leaveBalances || []);
        
        // Set first leave type as default if available
        if (typesResponse.leaveTypes && typesResponse.leaveTypes.length > 0) {
          setLeaveType(typesResponse.leaveTypes[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching leave data:', err);
        setError('Failed to load leave data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leaveType || !startDate || !endDate || !reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await employeeLeaveApi.submitLeaveRequest({
        leaveTypeId: parseInt(leaveType),
        startDate,
        endDate,
        reason
      });
      
      alert('Leave request submitted successfully!');
      navigate('/leave');
    } catch (err: any) {
      console.error('Error submitting leave request:', err);
      alert(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading leave data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/leave')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Request Leave</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Leave Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.days} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md h-32"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveBalances.map((leave, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{leave.type}</span>
                    <Badge variant="secondary">
                      {leave.used}/{leave.total} days
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-500 space-y-2">
              <p>• Requests must be submitted at least 7 days in advance</p>
              <p>• Maximum consecutive leave days: 14</p>
              <p>• Approval required from direct supervisor</p>
              <p>• Sick leave requires medical certificate for 3+ days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}