import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Calendar, AlertCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PerformanceApi } from '@/services/performanceApi';

export function SetNewGoal() {
  const navigate = useNavigate();
  const [goalTitle, setGoalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('professional');
  const [milestones, setMilestones] = useState<{ title: string; dueDate?: string }[]>([]);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAddMilestone = () => {
    if (!milestoneTitle.trim()) return;
    setMilestones([...milestones, { title: milestoneTitle, dueDate: milestoneDueDate }]);
    setMilestoneTitle('');
    setMilestoneDueDate('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const goal = {
        title: goalTitle,
        description,
        category,
        deadline: targetDate,
        status: 'on-track',
        progress: 0,
        milestones,
      };
      await PerformanceApi.addGoal(goal);
      setSuccess('Goal and milestones added successfully!');
      setGoalTitle('');
      setDescription('');
      setTargetDate('');
      setCategory('professional');
      setMilestones([]);
    } catch (err: any) {
      setError('Failed to add goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center">Set New Goal</h1>
        <div className="w-24" /> {/* Spacer for alignment */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter goal title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="professional">Professional Development</option>
                  <option value="performance">Performance</option>
                  <option value="learning">Learning & Development</option>
                  <option value="leadership">Leadership</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-32"
                  placeholder="Describe your goal and key milestones"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {/* Milestones Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Milestones</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Milestone title"
                  />
                  <input
                    type="date"
                    value={milestoneDueDate}
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    className="p-2 border rounded-md"
                  />
                  <Button type="button" variant="outline" onClick={handleAddMilestone}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {milestones.length > 0 && (
                  <ul className="space-y-2">
                    {milestones.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <span className="flex-1">{m.title} {m.dueDate && <span className="text-xs text-gray-500">(Due: {m.dueDate})</span>}</span>
                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveMilestone(idx)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {success && <div className="text-green-600 text-sm">{success}</div>}
              {error && <div className="text-red-600 text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                <Target className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Set Goal'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Setting Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <p>• Make your goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)</p>
                <p>• Break down larger goals into smaller milestones</p>
                <p>• Align goals with your career development plan</p>
                <p>• Consider both short-term and long-term objectives</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Important Notice</p>
              </div>
              <p className="mt-2 text-sm text-blue-700">
                Goals will be reviewed by your supervisor and included in your next performance review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}