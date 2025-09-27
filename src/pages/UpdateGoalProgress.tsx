import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  Clock,
  Calendar,
  Edit,
  Save,
  Plus,
  X,
  Star,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { PerformanceApi } from "@/services/performanceApi";

export function UpdateGoalProgress() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get goal data from navigation state or use default mock data
  const goalData = location.state?.goal || {
    id: 1,
    title: "Complete Advanced React Certification",
    category: "Learning & Development",
    progress: 85,
    deadline: new Date("2025-06-30"),
    status: "on-track",
    description: "Enhance React skills through advanced certification program",
    milestones: [
      {
        id: 1,
        title: "Complete Fundamentals Module",
        completed: true,
        dueDate: "2025-03-15",
      },
      {
        id: 2,
        title: "Finish Advanced Concepts",
        completed: true,
        dueDate: "2025-04-30",
      },
      {
        id: 3,
        title: "Pass Final Certification Exam",
        completed: false,
        dueDate: "2025-06-30",
      },
    ],
  };

  // Ensure each milestone has a unique id (fallback to index+1 if missing)
  const initialMilestones = (goalData.milestones || []).map(
    (
      m: { id?: number; title: string; completed: boolean; dueDate?: string },
      idx: number
    ) => ({
      ...m,
      id: m.id ?? idx + 1,
    })
  );

  const [_currentProgress, setCurrentProgress] = useState(goalData.progress);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [notes, setNotes] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Calculate overall progress based on completed milestones
  const calculateProgress = () => {
    const completedCount = milestones.filter(
      (m: { completed: boolean }) => m.completed
    ).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  // In handleMilestoneToggle, when marking as completed, set status to 'pending' and submit only that milestone for approval
  const handleMilestoneToggle = async (milestoneId: number) => {
    setMilestones((prev: any[]) =>
      prev.map((milestone: any) =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              completed: !milestone.completed,
              status: !milestone.completed ? "pending" : "assigned",
            }
          : milestone
      )
    );
    // If marking as completed, submit for approval
    const milestone = milestones.find((m: any) => m.id === milestoneId);
    if (milestone && !milestone.completed) {
      try {
        await PerformanceApi.updateMilestone(
          goalData.id,
          milestoneId,
          "pending"
        );
      } catch (_err) {
        setSubmitError("Failed to submit milestone for approval.");
      }
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      const newMilestoneObj = {
        id: Date.now(),
        title: newMilestone.trim(),
        completed: false,
        dueDate: new Date().toISOString().split("T")[0],
      };
      setMilestones((prev: any[]) => [...prev, newMilestoneObj]);
      setNewMilestone("");
      setShowAddMilestone(false);
    }
  };

  const handleRemoveMilestone = (milestoneId: number) => {
    setMilestones((prev: any[]) =>
      prev.filter((m: any) => m.id !== milestoneId)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      // For each milestone marked as completed and not already approved, submit for approval
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (m.completed && m.status !== "approved") {
          await PerformanceApi.updateMilestone(goalData.id, m.id, "pending");
        }
      }
      setIsSubmitting(false);
      navigate("/performance", {
        state: {
          message: "Milestone(s) submitted for approval!",
        },
      });
    } catch (err) {
      setSubmitError("Failed to submit milestone(s) for approval.");
      setIsSubmitting(false);
    }
  };

  const _getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "on-track":
        return "text-blue-600 bg-blue-100";
      case "at-risk":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "on-track":
        return "secondary";
      case "at-risk":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/performance")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Performance
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Update Goal Progress</h1>
            <p className="text-muted-foreground">
              Track and update your goal milestones
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Progress
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{goalData.title}</h3>
                  <p className="text-muted-foreground">
                    {goalData.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground">
                      {goalData.category}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Deadline</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(goalData.deadline)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={getStatusBadge(goalData.status)}>
                      {goalData.status === "completed"
                        ? "Completed"
                        : goalData.status === "on-track"
                        ? "On Track"
                        : "At Risk"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Overall Progress</Label>
                    <span className="font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {milestones.filter((m: any) => m.completed).length} of{" "}
                    {milestones.length} milestones completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Milestones
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMilestone(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone: any) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      checked={milestone.completed}
                      disabled={milestone.status === "approved"}
                      onCheckedChange={() =>
                        handleMilestoneToggle(milestone.id)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            milestone.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {milestone.title}
                        </span>
                        {milestone.completed &&
                          milestone.status === "approved" && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        {milestone.status === "pending" && (
                          <span className="text-xs text-yellow-600 ml-2">
                            Pending Approval
                          </span>
                        )}
                        {milestone.status === "rejected" && (
                          <span className="text-xs text-red-600 ml-2">
                            Rejected: {milestone.rejectionReason}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Due: {milestone.dueDate}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {showAddMilestone && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Enter milestone title..."
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddMilestone()
                        }
                      />
                      <Button size="sm" onClick={handleAddMilestone}>
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddMilestone(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {submitError && (
                  <div className="text-red-600 text-sm mt-2">{submitError}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Progress Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="notes">Add notes about your progress</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your progress, challenges, achievements, or any updates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  These notes will be visible to your manager during performance
                  reviews.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Summary */}
        <div className="space-y-6">
          {/* Progress Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculateProgress()}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Overall Progress
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium">
                      {milestones.filter((m: any) => m.completed).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Remaining</span>
                    <span className="font-medium">
                      {milestones.filter((m: any) => !m.completed).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <span className="font-medium">{milestones.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((milestone: any, index: number) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        milestone.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          milestone.completed
                            ? "line-through text-muted-foreground"
                            : "font-medium"
                        }`}
                      >
                        {milestone.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {milestone.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Request Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
