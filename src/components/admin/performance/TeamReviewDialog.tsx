import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Calendar, 
  Star, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Send,
  Download
} from 'lucide-react';

interface TeamReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: number;
}

export function TeamReviewDialog({ open, onOpenChange, employeeId }: TeamReviewDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewNotes, setReviewNotes] = useState('');

  // Mock data for team member review
  const employeeData = {
    id: employeeId || 1,
    name: 'Alex Johnson',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    startDate: '2023-03-15',
    lastReview: '2024-12-31',
    nextReview: '2025-06-30',
    overallRating: 4.2,
    avatar: '/avatars/01.png',
    email: 'alex.johnson@company.com',
    manager: 'Sarah Williams'
  };

  const performanceMetrics = [
    { category: 'Technical Skills', score: 92, target: 85, weight: 30, trend: '+5%' },
    { category: 'Communication', score: 88, target: 80, weight: 20, trend: '+8%' },
    { category: 'Leadership', score: 85, target: 75, weight: 25, trend: '+10%' },
    { category: 'Problem Solving', score: 90, target: 85, weight: 15, trend: '+5%' },
    { category: 'Team Collaboration', score: 87, target: 80, weight: 10, trend: '+7%' }
  ];

  const goals = [
    {
      id: 1,
      title: 'Complete Advanced React Certification',
      status: 'Completed',
      progress: 100,
      rating: 5,
      comment: 'Successfully completed the certification with distinction. Demonstrated excellent understanding of advanced React concepts.'
    },
    {
      id: 2,
      title: 'Improve Team Collaboration Score',
      status: 'In Progress',
      progress: 75,
      rating: 4,
      comment: 'Made significant improvements in team collaboration. Still has room for growth in cross-functional communication.'
    },
    {
      id: 3,
      title: 'Achieve Customer Satisfaction Target',
      status: 'Completed',
      progress: 100,
      rating: 4,
      comment: 'Exceeded customer satisfaction targets by 15%. Received positive feedback from multiple clients.'
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Led successful project launch',
      date: 'February 15, 2025',
      impact: 'High',
      description: 'Successfully led the development and launch of the new e-commerce platform, resulting in 25% increase in sales'
    },
    {
      id: 2,
      title: 'Mentored 3 junior developers',
      date: 'January 30, 2025',
      impact: 'Medium',
      description: 'Provided guidance and training to junior team members, improving team productivity and knowledge sharing'
    },
    {
      id: 3,
      title: 'Implemented CI/CD pipeline improvements',
      date: 'March 10, 2025',
      impact: 'High',
      description: 'Reduced deployment time by 60% and improved code quality through automated testing and deployment processes'
    }
  ];

  const feedback = [
    {
      id: 1,
      from: 'Sarah Williams',
      role: 'Team Lead',
      date: 'March 25, 2025',
      rating: 4.5,
      category: 'Overall Performance',
      comment: 'Alex has demonstrated exceptional growth this quarter. His technical skills have improved significantly, and he has taken on more leadership responsibilities within the team. His ability to mentor junior developers has been particularly valuable.'
    },
    {
      id: 2,
      from: 'Michael Chen',
      role: 'Product Manager',
      date: 'March 28, 2025',
      rating: 4.0,
      category: 'Communication',
      comment: 'Alex communicates technical concepts very clearly to stakeholders. He could improve his proactive communication in cross-functional meetings, but overall his communication skills are strong.'
    }
  ];

  const reviewQuestions = [
    {
      id: 1,
      category: 'Performance Assessment',
      questions: [
        'How well has this employee met their performance objectives?',
        'What are the employee\'s key strengths and areas for improvement?',
        'How effectively does the employee contribute to team goals?'
      ]
    },
    {
      id: 2,
      category: 'Development & Growth',
      questions: [
        'What development opportunities would benefit this employee?',
        'How has the employee grown since their last review?',
        'What skills should the employee focus on developing?'
      ]
    },
    {
      id: 3,
      category: 'Future Planning',
      questions: [
        'What are the recommended goals for the next review period?',
        'How can we support this employee\'s career development?',
        'What resources or training would be beneficial?'
      ]
    }
  ];

  const handleSubmitReview = () => {
    // Mock function to submit review
    console.log('Submitting review for:', employeeData.name);
    console.log('Review notes:', reviewNotes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Team Member Review - {employeeData.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Overview */}
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
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="text-sm font-medium">{employeeData.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Review:</span>
                    <span className="text-sm font-medium">{employeeData.lastReview}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next Review:</span>
                    <span className="text-sm font-medium">{employeeData.nextReview}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Overall Rating:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{employeeData.overallRating}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 ${star <= Math.floor(employeeData.overallRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Manager:</span>
                    <span className="text-sm font-medium">{employeeData.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{employeeData.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceMetrics.map((metric) => (
                        <div key={metric.category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{metric.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{metric.score}%</span>
                              <Badge variant="outline" className="text-xs">
                                {metric.trend}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={metric.score} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Target: {metric.target}%</span>
                            <span>Weight: {metric.weight}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{achievement.title}</h4>
                            <Badge variant={achievement.impact === 'High' ? 'default' : 'secondary'}>
                              {achievement.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goals Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">{goal.comment}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={goal.status === 'Completed' ? 'default' : 'secondary'}>
                              {goal.status}
                            </Badge>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-3 w-3 ${star <= goal.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-sm font-medium ml-1">{goal.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Peer Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="font-medium text-sm">
                                {item.from.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{item.from}</h4>
                              <p className="text-sm text-muted-foreground">{item.role}</p>
                              <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-3 w-3 ${star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-sm font-medium ml-1">{item.rating}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Review Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Review Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviewQuestions.map((category) => (
                        <div key={category.id} className="space-y-3">
                          <h4 className="font-semibold text-lg">{category.category}</h4>
                          <div className="space-y-3">
                            {category.questions.map((question, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <p className="text-sm font-medium mb-2">{question}</p>
                                <Textarea 
                                  placeholder="Enter your response..."
                                  rows={2}
                                  className="resize-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Review Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Review Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add your overall review notes and recommendations..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export Draft
                        </Button>
                        <Button size="sm" onClick={handleSubmitReview}>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 