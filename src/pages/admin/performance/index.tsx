import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart2, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users as UsersIcon,
  Star,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ReviewDetailsDialog } from '@/components/admin/performance/ReviewDetailsDialog';
import { RequestFeedbackDialog } from '@/components/admin/performance/RequestFeedbackDialog';
import { TeamReviewDialog } from '@/components/admin/performance/TeamReviewDialog';
import { useEffect } from 'react';
import { PerformanceApi } from '@/services/performanceApi';
import PrepareReviewPage from './prepare-review';

export default function PerformancePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<string>('overview');
  const [reviewDetailsOpen, setReviewDetailsOpen] = useState(false);
  const [requestFeedbackOpen, setRequestFeedbackOpen] = useState(false);
  const [teamReviewOpen, setTeamReviewOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  
  // Remove all mock data arrays
  // Add state for real data
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState('');

  useEffect(() => {
    setLoadingOverview(true);
    setOverviewError('');
    // Fetch all overview data in parallel
    Promise.all([
      PerformanceApi.getAllEmployeeGoals(),
      PerformanceApi.getReviewHistory(),
      PerformanceApi.getAchievements(),
      PerformanceApi.getAllEmployees()
    ])
      .then(([goalsData, reviewHistory, achievements, employees]) => {
        setGoals(goalsData);
        setRecentActivities([...reviewHistory, ...achievements]);
        setTeamMembers(employees);
        // Aggregate performance metrics from reviewHistory
        const completedReviews = reviewHistory.filter((r: any) => r.result && (typeof r.result === 'object' || typeof r.result === 'string'));
        let totalRating = 0;
        let ratingCount = 0;
        let metrics: any[] = [];
        completedReviews.forEach((r: any) => {
          let result = r.result;
          if (typeof result === 'string') {
            try { result = JSON.parse(result); } catch { result = null; }
          }
          if (result && typeof result === 'object' && result.overallRating) {
            totalRating += Number(result.overallRating);
            ratingCount++;
    }
        });
        if (ratingCount > 0) {
          metrics.push({ name: 'Average Overall Rating', score: (totalRating / ratingCount).toFixed(2), target: 5, progress: ((totalRating / ratingCount) / 5 * 100).toFixed(0) });
        }
        metrics.push({ name: 'Total Reviews', score: completedReviews.length, target: '', progress: 100 });
        setPerformanceMetrics(metrics);
      })
      .catch(() => setOverviewError('Failed to load overview data.'))
      .finally(() => setLoadingOverview(false));
  }, []);

  // Add state for real employee goals
  const [employeeGoals, setEmployeeGoals] = useState<any[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [goalsError, setGoalsError] = useState('');
  const [milestoneActionError, setMilestoneActionError] = useState('');
  const [milestoneActionLoading, setMilestoneActionLoading] = useState<{[key: string]: boolean}>({});

  // Fetch real employee goals when the goals tab is active
  useEffect(() => {
    if (activeTab === 'goals') {
      setLoadingGoals(true);
      setGoalsError('');
      PerformanceApi.getAllEmployeeGoals()
        .then((data) => setEmployeeGoals(data))
        .catch(() => setGoalsError('Failed to load employee goals.'))
        .finally(() => setLoadingGoals(false));
    }
  }, [activeTab]);

  const handleApproveMilestone = async (employeeId: number, goalIndex: number, milestoneIndex: number) => {
    setMilestoneActionLoading((prev) => ({ ...prev, [`${employeeId}-${goalIndex}-${milestoneIndex}`]: true }));
    setMilestoneActionError('');
    try {
      await PerformanceApi.approveMilestone(employeeId, goalIndex, milestoneIndex);
      // Refresh goals after approval
      const data = await PerformanceApi.getAllEmployeeGoals();
      setEmployeeGoals(data);
    } catch (err) {
      setMilestoneActionError('Failed to approve milestone.');
    } finally {
      setMilestoneActionLoading((prev) => ({ ...prev, [`${employeeId}-${goalIndex}-${milestoneIndex}`]: false }));
    }
  };
  const handleRejectMilestone = async (employeeId: number, goalIndex: number, milestoneIndex: number, rejectionReason: string) => {
    setMilestoneActionLoading((prev) => ({ ...prev, [`${employeeId}-${goalIndex}-${milestoneIndex}`]: true }));
    setMilestoneActionError('');
    try {
      await PerformanceApi.rejectMilestone(employeeId, goalIndex, milestoneIndex, rejectionReason);
      // Refresh goals after rejection
      const data = await PerformanceApi.getAllEmployeeGoals();
      setEmployeeGoals(data);
    } catch (err) {
      setMilestoneActionError('Failed to reject milestone.');
    } finally {
      setMilestoneActionLoading((prev) => ({ ...prev, [`${employeeId}-${goalIndex}-${milestoneIndex}`]: false }));
    }
  };

  // Extract data from API response
  const performance = {
    metrics: performanceMetrics,
    goals: goals,
    achievements: [], // No achievements in mock data
    feedback: [], // No feedback in mock data
    reviews: [], // No reviews in mock data
    employeeData: {} // No employeeData in mock data
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance metrics and goals
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Overall Performance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Performance
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Calculate mean percent of goals reached per employee */}
                {(() => {
                  if (!goals.length) return <div className="text-2xl font-bold">0%</div>;
                  // Group goals by employee
                  const goalsByEmployee: { [key: string]: any[] } = {};
                  goals.forEach((g: any) => {
                    if (!goalsByEmployee[g.employee_id]) goalsByEmployee[g.employee_id] = [];
                    goalsByEmployee[g.employee_id].push(g);
                  });
                  const employeeMeans = Object.values(goalsByEmployee).map((goalsArr: any[]) => {
                    if (!goalsArr.length) return 0;
                    const total = goalsArr.reduce((sum: number, g: any) => sum + (g.progress || 0), 0);
                    return total / goalsArr.length;
                  });
                  const mean = employeeMeans.length ? (employeeMeans.reduce((a: number, b: number) => a + b, 0) / employeeMeans.length) : 0;
                  return <div className="text-2xl font-bold">{mean.toFixed(1)}%</div>;
                })()}
                <p className="text-xs text-muted-foreground">
                  Company-wide average goal completion
                </p>
              </CardContent>
            </Card>
            {/* Goals in Progress Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Goals in Progress
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.filter(g => g.status !== 'completed').length}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time count of ongoing goals
                </p>
              </CardContent>
            </Card>
            {/* Upcoming Reviews Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Reviews
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentActivities.filter(a => a.status !== 'completed' && a.type === 'review').length}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled reviews
                </p>
              </CardContent>
            </Card>
            {/* Achievements Card (was Team Average) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Achievements
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentActivities.filter(a => a.type === 'achievement' || a.badge).length}</div>
                <p className="text-xs text-muted-foreground">
                  Awards given on the platform
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {performanceMetrics.map((metric) => (
                  <div key={metric.name} className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className="text-sm font-medium">
                        {metric.score}% <span className="text-muted-foreground">/ {metric.target}%</span>
                      </span>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 mt-0.5 ${
                        activity.type === 'goal' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'review' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {activity.type === 'goal' ? (
                          <Target className="h-4 w-4" />
                        ) : activity.type === 'review' ? (
                          <MessageSquare className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                          {!activity.read && (
                            <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date && !isNaN(new Date(activity.date).getTime())
                            ? `${format(new Date(activity.date), 'MMM d, yyyy')} • ${format(new Date(activity.date), 'h:mm a')}`
                            : (console.warn('Invalid date in activity:', activity), 'No date available')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">All Employee Goals</h2>
            <Button size="sm" onClick={() => navigate('/admin/performance/assign-goal')}>+ New Goal</Button>
          </div>
          <div className="space-y-4">
            {loadingGoals && <div>Loading goals...</div>}
            {goalsError && <div className="text-red-600 text-sm">{goalsError}</div>}
            {!loadingGoals && !goalsError && employeeGoals.length === 0 && (
              <div className="text-muted-foreground">No goals found.</div>
            )}
            {!loadingGoals && !goalsError && employeeGoals.map((goal, idx) => {
              let progress = 0;
              if (goal.milestones && goal.milestones.length > 0) {
                const approved = goal.milestones.filter((m: any) => m.status === 'approved').length;
                progress = Math.round((approved / goal.milestones.length) * 100);
              }
              // Determine status based on progress
              let status = goal.status;
              if (progress === 100) {
                status = 'completed';
              } else if (status === 'completed' && progress < 100) {
                status = 'on-track'; // fallback if data is out of sync
              }
              // Find the correct goalIndex for this goal in the employee's own goals array
              const employeeGoalsForThisEmployee = employeeGoals.filter(g => g.employee_id === goal.employee_id);
              const employeeGoalIndex = employeeGoalsForThisEmployee.findIndex((g: any) => g.title === goal.title && g.description === goal.description && g.milestones && g.milestones.length === goal.milestones.length);
              return (
                <Card key={goal.id || idx}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{goal.category}</p>
                        <p className="text-xs text-muted-foreground">Employee ID: {goal.employee_id}</p>
                    </div>
                    <Badge variant={status === 'completed' ? 'default' : status === 'on-track' ? 'secondary' : 'destructive'}>
                      {status === 'completed' ? 'Completed' : status === 'on-track' ? 'On Track' : 'At Risk'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                      <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Due {goal.deadline ? format(new Date(goal.deadline), 'MMM d, yyyy') : '-'}</span>
                        <span>{goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days left' : '-'}</span>
                      </div>
                      {/* Milestones Section */}
                      {goal.milestones && goal.milestones.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm mb-2">Milestones</h4>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone: any, msIdx: number) => (
                              <div key={milestone.id || msIdx} className="flex items-center gap-2 p-2 border rounded">
                                <span className={`text-sm ${milestone.status === 'approved' ? 'line-through text-green-600' : milestone.status === 'rejected' ? 'text-red-600' : ''}`}>{milestone.title}</span>
                                {milestone.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      disabled={milestoneActionLoading[`${goal.employee_id}-${employeeGoalIndex}-${msIdx}`]}
                                      onClick={() => handleApproveMilestone(goal.employee_id, employeeGoalIndex, msIdx)}
                                    >Approve</Button>
                                    <RejectMilestoneButton
                                      onReject={(reason) => handleRejectMilestone(goal.employee_id, employeeGoalIndex, msIdx, reason)}
                                      loading={milestoneActionLoading[`${goal.employee_id}-${employeeGoalIndex}-${msIdx}`]}
                                    />
                                  </>
                                )}
                                {milestone.status === 'pending' && <span className="text-xs text-yellow-600 ml-2">Pending Approval</span>}
                                {milestone.status === 'rejected' && <span className="text-xs text-red-600 ml-2">Rejected: {milestone.rejectionReason}</span>}
                                {milestone.status === 'approved' && <CheckCircle2 className="h-4 w-4 text-green-600 ml-2" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {milestoneActionError && <div className="text-red-600 text-sm mt-2">{milestoneActionError}</div>}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <PrepareReviewPage />
        </TabsContent>

      </Tabs>

      {/* Dialog Components */}
      <ReviewDetailsDialog 
        open={reviewDetailsOpen} 
        onOpenChange={setReviewDetailsOpen} 
      />
      <RequestFeedbackDialog 
        open={requestFeedbackOpen} 
        onOpenChange={setRequestFeedbackOpen} 
      />
      <TeamReviewDialog 
        open={teamReviewOpen} 
        onOpenChange={setTeamReviewOpen} 
        employeeId={selectedEmployeeId}
      />
    </div>
  );
}

function RejectMilestoneButton({ onReject, loading }: { onReject: (reason: string) => void, loading: boolean }) {
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState('');
  return show ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="border rounded px-2 py-1 text-xs"
        placeholder="Rejection reason"
        value={reason}
        onChange={e => setReason(e.target.value)}
        disabled={loading}
      />
      <Button size="sm" variant="destructive" disabled={loading || !reason.trim()} onClick={() => { onReject(reason); setShow(false); setReason(''); }}>Reject</Button>
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => setShow(false)}>Cancel</Button>
    </div>
  ) : (
    <Button size="sm" variant="outline" disabled={loading} onClick={() => setShow(true)}>Reject</Button>
  );
}
