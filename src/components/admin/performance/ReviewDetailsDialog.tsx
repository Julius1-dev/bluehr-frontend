import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Calendar, User, Target, BarChart3, MessageSquare, Award } from 'lucide-react';

interface ReviewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDetailsDialog({ open, onOpenChange }: ReviewDetailsDialogProps) {
  // Mock data for review details
  const reviewData = {
    id: 'Q1-2025-001',
    employee: 'Alex Johnson',
    role: 'Senior Software Engineer',
    reviewType: 'Q1 Performance Review',
    reviewDate: 'March 31, 2025',
    reviewer: 'Sarah Williams',
    overallRating: 4.5,
    status: 'Completed',
    nextReviewDate: 'June 30, 2025'
  };

  const performanceScores = [
    { category: 'Technical Skills', score: 92, target: 85, weight: 30 },
    { category: 'Communication', score: 88, target: 80, weight: 20 },
    { category: 'Leadership', score: 85, target: 75, weight: 25 },
    { category: 'Problem Solving', score: 90, target: 85, weight: 15 },
    { category: 'Team Collaboration', score: 87, target: 80, weight: 10 }
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
      status: 'Partially Completed',
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

  const recommendations = [
    'Continue developing leadership skills by taking on more project management responsibilities',
    'Enhance cross-functional communication by participating more actively in stakeholder meetings',
    'Consider pursuing advanced certifications in cloud technologies',
    'Take initiative in identifying and implementing process improvements'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Review Details - {reviewData.reviewType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Review Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Employee:</span>
                    <span className="text-sm font-medium">{reviewData.employee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <span className="text-sm font-medium">{reviewData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Review Type:</span>
                    <span className="text-sm font-medium">{reviewData.reviewType}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Review Date:</span>
                    <span className="text-sm font-medium">{reviewData.reviewDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reviewer:</span>
                    <span className="text-sm font-medium">{reviewData.reviewer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="default">{reviewData.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Rating:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= Math.floor(reviewData.overallRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{reviewData.overallRating}/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceScores.map((metric) => (
                  <div key={metric.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{metric.score}%</span>
                        <Badge variant="outline" className="text-xs">
                          Weight: {metric.weight}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {metric.target}%</span>
                      <span>Current: {metric.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Assessment */}
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

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback
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

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Key Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{achievement.title}</h4>
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

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations for Next Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Review */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Next Review Date</h4>
                  <p className="text-sm text-muted-foreground">{reviewData.nextReviewDate}</p>
                </div>
                <Badge variant="outline">Q2 2025</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 