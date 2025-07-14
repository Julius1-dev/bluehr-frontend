import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { BarChart2, ArrowRight, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { Badge } from '../ui/badge';

export function PerformanceWidget() {
  const performanceMetrics = [
    { name: 'Quality of Work', score: 85, max: 100 },
    { name: 'Timeliness', score: 90, max: 100 },
    { name: 'Initiative', score: 75, max: 100 },
    { name: 'Communication', score: 80, max: 100 }
  ];
  
  const averageScore = performanceMetrics.reduce((acc, metric) => acc + metric.score, 0) / performanceMetrics.length;
  
  const nextReview = {
    date: new Date('2025-06-30'),
    type: 'Quarterly Review',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Performance</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View Details
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{Math.round(averageScore)}%</div>
              <div className="text-xs text-blue-600 font-medium">Overall</div>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-2">Last Performance Review</h4>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${
                    i < Math.round(averageScore / 20) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            
            <div className="text-sm text-gray-500">
              Great work this quarter! Keep up the good communication and quality of deliverables.
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
          
          {performanceMetrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{metric.name}</span>
                <span className="text-sm text-gray-500">
                  {metric.score}/{metric.max}
                </span>
              </div>
              <Progress 
                value={(metric.score / metric.max) * 100} 
                variant={
                  metric.score >= 85 ? 'success' : 
                  metric.score >= 70 ? 'default' : 'warning'
                }
                className="h-2" 
              />
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Next Review</div>
            <div className="text-sm text-gray-500">
              {formatDate(nextReview.date)} ({nextReview.type})
            </div>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <BarChart2 className="mr-1 h-4 w-4" />
            Set Goals
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}