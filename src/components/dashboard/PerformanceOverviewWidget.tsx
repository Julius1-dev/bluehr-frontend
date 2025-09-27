import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PerformanceOverviewWidget(): JSX.Element {
  const navigate = useNavigate();

  // Mock performance data
  const departmentPerformance: { department: string; score: number }[] = [
    { department: "Engineering", score: 87 },
    { department: "Design", score: 92 },
    { department: "Product", score: 85 },
    { department: "HR", score: 90 },
    { department: "Marketing", score: 83 },
  ];

  // Mock top performers
  const topPerformers: {
    id: number;
    name: string;
    avatar: string;
    department: string;
    score: number;
  }[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      department: "Design",
      score: 98,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/avatars/michael.jpg",
      department: "Engineering",
      score: 95,
    },
    {
      id: 3,
      name: "Emma Wilson",
      avatar: "/avatars/emma.jpg",
      department: "HR",
      score: 94,
    },
  ];

  // Mock upcoming reviews
  const upcomingReviews: {
    id: number;
    name: string;
    avatar: string;
    department: string;
    dueDate: string;
  }[] = [
    {
      id: 1,
      name: "Aisha Patel",
      avatar: "/avatars/aisha.jpg",
      department: "Product",
      dueDate: "2025-06-10",
    },
    {
      id: 2,
      name: "David Kim",
      avatar: "/avatars/david.jpg",
      department: "Engineering",
      dueDate: "2025-06-15",
    },
  ];

  const _getDepartmentColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Performance Overview
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600"
          onClick={() => navigate("/admin/performance")}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">
              Department Performance
            </h3>
            <div className="space-y-3">
              {departmentPerformance.map((dept) => (
                <div key={dept.department} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{dept.department}</span>
                    <span
                      className={`text-sm font-medium ${getScoreColor(
                        dept.score
                      )}`}
                    >
                      {dept.score}%
                    </span>
                  </div>
                  <Progress
                    value={dept.score}
                    className={`h-2 ${getProgressColor(dept.score)}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Top Performers
              </h3>
              <div className="space-y-3">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={performer.avatar}
                        alt={performer.name}
                      />
                      <AvatarFallback>
                        {performer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{performer.name}</p>
                      <p className="text-xs text-gray-500">
                        {performer.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      <Award className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {performer.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Upcoming Reviews
              </h3>
              <div className="space-y-3">
                {upcomingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center gap-3 border border-gray-100 p-2 rounded-lg"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback>
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{review.name}</p>
                      <p className="text-xs text-gray-500">
                        {review.department}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Due: {new Date(review.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate("/admin/performance-reviews")}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Schedule Performance Reviews
        </Button>
      </CardFooter>
    </Card>
  );
}
