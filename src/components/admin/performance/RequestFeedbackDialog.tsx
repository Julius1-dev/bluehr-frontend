import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  User, 
  MessageSquare, 
  Send, 
  X,
  Search,
  Filter
} from 'lucide-react';

interface RequestFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestFeedbackDialog({ open, onOpenChange }: RequestFeedbackDialogProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('360');

  // Mock data for potential reviewers
  const potentialReviewers = [
    {
      id: '1',
      name: 'Sarah Williams',
      role: 'Team Lead',
      department: 'Engineering',
      relationship: 'Direct Manager',
      email: 'sarah.williams@company.com',
      avatar: '/avatars/02.png',
      lastFeedback: '2025-03-15'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Product Manager',
      department: 'Product',
      relationship: 'Peer',
      email: 'michael.chen@company.com',
      avatar: '/avatars/03.png',
      lastFeedback: '2025-02-20'
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'UX Designer',
      department: 'Design',
      relationship: 'Peer',
      email: 'emily.davis@company.com',
      avatar: '/avatars/04.png',
      lastFeedback: '2025-04-10'
    },
    {
      id: '4',
      name: 'David Wilson',
      role: 'Senior Developer',
      department: 'Engineering',
      relationship: 'Peer',
      email: 'david.wilson@company.com',
      avatar: '/avatars/05.png',
      lastFeedback: '2025-01-15'
    },
    {
      id: '5',
      name: 'Lisa Brown',
      role: 'QA Engineer',
      department: 'Engineering',
      relationship: 'Subordinate',
      email: 'lisa.brown@company.com',
      avatar: '/avatars/06.png',
      lastFeedback: '2025-03-05'
    },
    {
      id: '6',
      name: 'John Smith',
      role: 'DevOps Engineer',
      department: 'Engineering',
      relationship: 'Peer',
      email: 'john.smith@company.com',
      avatar: '/avatars/07.png',
      lastFeedback: '2025-02-28'
    }
  ];

  const feedbackTypes = [
    {
      id: '360',
      name: '360° Feedback',
      description: 'Comprehensive feedback from peers, managers, and subordinates',
      duration: '2-3 weeks',
      questions: 25
    },
    {
      id: 'peer',
      name: 'Peer Feedback',
      description: 'Feedback from colleagues at the same level',
      duration: '1-2 weeks',
      questions: 15
    },
    {
      id: 'manager',
      name: 'Manager Feedback',
      description: 'Direct feedback from immediate supervisor',
      duration: '1 week',
      questions: 10
    },
    {
      id: 'custom',
      name: 'Custom Feedback',
      description: 'Tailored feedback request with specific questions',
      duration: 'Variable',
      questions: 'Custom'
    }
  ];

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(reviewerId) 
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const handleSendRequest = () => {
    // Mock function to send feedback request
    console.log('Sending feedback request to:', selectedReviewers);
    console.log('Feedback type:', feedbackType);
    console.log('Custom message:', customMessage);
    onOpenChange(false);
  };

  const selectedReviewersData = potentialReviewers.filter(reviewer => 
    selectedReviewers.includes(reviewer.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Feedback Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      feedbackType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFeedbackType(type.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{type.name}</h4>
                      {feedbackType === type.id && (
                        <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Duration: {type.duration}</span>
                      <span>{type.questions} questions</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reviewers..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Reviewers List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {potentialReviewers.map((reviewer) => (
                    <div
                      key={reviewer.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReviewers.includes(reviewer.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleReviewerToggle(reviewer.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedReviewers.includes(reviewer.id)}
                          onChange={() => handleReviewerToggle(reviewer.id)}
                        />
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="font-medium text-sm">
                            {reviewer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{reviewer.name}</h4>
                          <p className="text-xs text-muted-foreground">{reviewer.role} • {reviewer.department}</p>
                          <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">{reviewer.relationship}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">Last: {reviewer.lastFeedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Reviewers Summary */}
          {selectedReviewersData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selected Reviewers ({selectedReviewersData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedReviewersData.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="font-medium text-xs">
                            {reviewer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{reviewer.name}</span>
                        <Badge variant="outline" className="text-xs">{reviewer.relationship}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReviewerToggle(reviewer.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Message */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Message (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add a personal message to your feedback request..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This message will be included in the feedback request email sent to selected reviewers.
              </p>
            </CardContent>
          </Card>

          {/* Request Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Feedback Type:</span>
                  <span className="text-sm font-medium">
                    {feedbackTypes.find(t => t.id === feedbackType)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Number of Reviewers:</span>
                  <span className="text-sm font-medium">{selectedReviewersData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Duration:</span>
                  <span className="text-sm font-medium">
                    {feedbackTypes.find(t => t.id === feedbackType)?.duration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Questions:</span>
                  <span className="text-sm font-medium">
                    {feedbackTypes.find(t => t.id === feedbackType)?.questions}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendRequest}
              disabled={selectedReviewersData.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Feedback Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 