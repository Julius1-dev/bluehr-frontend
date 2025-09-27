import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Users,
  User,
  Target,
  BarChart3,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  Download,
  Share2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PerformanceApi } from '@/services/performanceApi';

export default function ThreeSixtyFeedbackPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [ownReviews, setOwnReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState('');

  useEffect(() => {
    setLoadingReviews(true);
    setErrorReviews('');
    PerformanceApi.getOwnPerformance()
      .then(data => setOwnReviews(data.reviews || []))
      .catch(() => setErrorReviews('Failed to load your reviews.'))
      .finally(() => setLoadingReviews(false));
  }, []);

  // Mock data for 360° feedback
  const employeeData = {
    name: 'Alex Johnson',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    startDate: '2023-03-15',
    feedbackPeriod: 'Q2 2025',
    dueDate: '2025-07-15',
    avatar: '/avatars/01.png'
  };

  const feedbackCategories = [
    { name: 'Leadership', description: 'Ability to lead and inspire others', questions: 5 },
    { name: 'Communication', description: 'Effectiveness in verbal and written communication', questions: 4 },
    { name: 'Technical Skills', description: 'Proficiency in technical competencies', questions: 6 },
    { name: 'Teamwork', description: 'Collaboration and team contribution', questions: 4 },
    { name: 'Problem Solving', description: 'Analytical thinking and solution development', questions: 5 },
    { name: 'Initiative', description: 'Proactive approach and self-motivation', questions: 3 }
  ];

  const reviewers = [
    {
      id: 1,
      name: 'Sarah Williams',
      role: 'Team Lead',
      relationship: 'Direct Manager',
      status: 'completed',
      completedDate: '2025-06-20',
      rating: 4.5,
      avatar: '/avatars/02.png'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Product Manager',
      relationship: 'Peer',
      status: 'completed',
      completedDate: '2025-06-18',
      rating: 4.2,
      avatar: '/avatars/03.png'
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'UX Designer',
      relationship: 'Peer',
      status: 'in-progress',
      completedDate: null,
      rating: null,
      avatar: '/avatars/04.png'
    },
    {
      id: 4,
      name: 'David Wilson',
      role: 'Senior Developer',
      relationship: 'Peer',
      status: 'pending',
      completedDate: null,
      rating: null,
      avatar: '/avatars/05.png'
    },
    {
      id: 5,
      name: 'Lisa Brown',
      role: 'QA Engineer',
      relationship: 'Subordinate',
      status: 'pending',
      completedDate: null,
      rating: null,
      avatar: '/avatars/06.png'
    }
  ];

  const feedbackQuestions = [
    {
      category: 'Leadership',
      questions: [
        'How effectively does this person lead by example?',
        'How well does this person motivate and inspire team members?',
        'How does this person handle difficult situations or conflicts?',
        'How effectively does this person delegate tasks and responsibilities?',
        'How well does this person provide guidance and mentorship?'
      ]
    },
    {
      category: 'Communication',
      questions: [
        'How clearly does this person communicate ideas and information?',
        'How well does this person listen to others and consider their input?',
        'How effectively does this person present information to different audiences?',
        'How well does this person provide constructive feedback?'
      ]
    },
    {
      category: 'Technical Skills',
      questions: [
        'How strong are this person\'s technical abilities in their role?',
        'How well does this person solve complex technical problems?',
        'How effectively does this person stay current with industry trends?',
        'How well does this person share technical knowledge with others?',
        'How effectively does this person apply best practices in their work?',
        'How well does this person handle technical challenges and setbacks?'
      ]
    }
  ];

  const progressStats = {
    totalReviewers: reviewers.length,
    completedReviews: reviewers.filter(r => r.status === 'completed').length,
    inProgressReviews: reviewers.filter(r => r.status === 'in-progress').length,
    pendingReviews: reviewers.filter(r => r.status === 'pending').length,
    averageRating: 4.35
  };

  const recentFeedback = [
    {
      id: 1,
      from: 'Sarah Williams',
      date: '2025-06-20',
      category: 'Leadership',
      rating: 4.5,
      comment: 'Alex demonstrates excellent leadership qualities. He consistently leads by example and has been instrumental in mentoring junior team members. His ability to handle difficult situations with calm and professionalism is commendable.'
    },
    {
      id: 2,
      from: 'Michael Chen',
      date: '2025-06-18',
      category: 'Communication',
      rating: 4.2,
      comment: 'Alex communicates technical concepts very clearly to both technical and non-technical stakeholders. He actively listens to feedback and incorporates it into his work effectively.'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Top-level debug output */}
      <div style={{background: 'yellow', color: 'black', padding: 8, borderRadius: 4, marginBottom: 12}}>
        DEBUG: 360-feedback page mounted
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/performance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Performance
          </Button>
          <div>
            <h1 className="text-2xl font-bold">360° Feedback</h1>
            <p className="text-muted-foreground">
              {employeeData.name} - {employeeData.feedbackPeriod}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Employee Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl font-semibold">
                  {employeeData.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{employeeData.name}</h3>
                <p className="text-muted-foreground">{employeeData.role}</p>
                <p className="text-sm text-muted-foreground">{employeeData.department}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Feedback Period:</span>
                <span className="text-sm font-medium">{employeeData.feedbackPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date:</span>
                <span className="text-sm font-medium">{employeeData.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline">In Progress</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Reviewers:</span>
                <span className="text-sm font-medium">{progressStats.totalReviewers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed:</span>
                <span className="text-sm font-medium">{progressStats.completedReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Rating:</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{progressStats.averageRating}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= Math.floor(progressStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-semibold">{progressStats.completedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold">{progressStats.inProgressReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold">{progressStats.pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-semibold">{progressStats.averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviewers">Reviewers</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Feedback Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackCategories.map((category) => (
                    <div key={category.name} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <Badge variant="outline">{category.questions} questions</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFeedback.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{item.from}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3 w-3 ${star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">{item.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">{item.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviewers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewers.map((reviewer) => (
                  <div key={reviewer.id} className="flex items-center p-4 border rounded-lg">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="font-medium text-sm">
                        {reviewer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">{reviewer.role}</p>
                      <p className="text-xs text-muted-foreground">{reviewer.relationship}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {reviewer.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3 w-3 ${star <= reviewer.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">{reviewer.rating}</span>
                        </div>
                      )}
                      <Badge variant={
                        reviewer.status === 'completed' ? 'default' : 
                        reviewer.status === 'in-progress' ? 'secondary' : 'outline'
                      }>
                        {reviewer.status === 'completed' ? 'Completed' : 
                         reviewer.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                      {reviewer.completedDate && (
                        <p className="text-xs text-muted-foreground">{reviewer.completedDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Feedback Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {feedbackQuestions.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <h4 className="font-semibold text-lg">{category.category}</h4>
                    <div className="space-y-3">
                      {category.questions.map((question, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <p className="text-sm font-medium">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {/* Debug Output */}
          <div className="p-2 bg-yellow-100 text-yellow-900 rounded mb-2">
            <div>DEBUG: activeTab = {activeTab}</div>
            <div>DEBUG: ownReviews.length = {ownReviews.length}</div>
            <div>DEBUG: ownReviews = <pre style={{maxHeight: 200, overflow: 'auto'}}>{JSON.stringify(ownReviews, null, 2)}</pre></div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                My Performance Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReviews ? (
                <div>Loading your reviews...</div>
              ) : errorReviews ? (
                <div className="text-red-500">{errorReviews}</div>
              ) : ownReviews.length === 0 ? (
                <div>No reviews found.</div>
              ) : (
                <div className="space-y-4">
                  {ownReviews.map((review, idx) => {
                    const result = review.result ? (typeof review.result === 'string' ? JSON.parse(review.result) : review.result) : {};
                    const main = result.result || result;
                    return (
                      <div key={review.id || idx} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.review_type || review.reviewType || ''} Review</span>
                          <span className="text-xs text-muted-foreground">{review.updated_at ? new Date(review.updated_at).toLocaleString() : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-4 w-4 ${i <= (main.overallRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          {main.overallRating && <span className="ml-2 text-sm font-medium">{main.overallRating}</span>}
                        </div>
                        {main.summary && <div className="text-sm mb-1"><b>Summary:</b> {main.summary}</div>}
                        {main.feedback && <div className="text-sm mb-1"><b>Feedback:</b> {main.feedback}</div>}
                        {main.goalComments && (
                          <div className="text-sm mb-1">
                            <b>Goal Comments:</b>
                            <ul className="list-disc ml-6">
                              {Object.entries(main.goalComments).map(([goalId, comment]: any) => (
                                <li key={goalId}>{comment}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {main.competencyRatings && (
                          <div className="text-sm mb-1">
                            <b>Competency Ratings:</b>
                            <ul className="list-disc ml-6">
                              {Object.entries(main.competencyRatings).map(([goalId, rating]: any) => (
                                <li key={goalId}>Goal {goalId}: {rating} / 5</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 