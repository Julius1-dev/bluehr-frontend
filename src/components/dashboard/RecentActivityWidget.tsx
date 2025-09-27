import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDate } from "@/lib/utils";

interface ActivityItem {
  id: number;
  type: "leave" | "payroll" | "document" | "performance" | "attendance";
  title: string;
  description: string;
  date: Date;
}

export function RecentActivityWidget() {
  const activities: ActivityItem[] = [
    {
      id: 1,
      type: "payroll",
      title: "Payslip Generated",
      description:
        "Your payslip for April 2025 has been generated and is ready for viewing.",
      date: new Date("2025-04-25T10:00:00"),
    },
    {
      id: 2,
      type: "leave",
      title: "Leave Request Approved",
      description: "Your request for 5 days of annual leave has been approved.",
      date: new Date("2025-04-22T14:30:00"),
    },
    {
      id: 3,
      type: "performance",
      title: "Quarterly Review Scheduled",
      description:
        "Your Q2 performance review has been scheduled for June 30, 2025.",
      date: new Date("2025-04-20T09:15:00"),
    },
    {
      id: 4,
      type: "document",
      title: "Document Shared",
      description: "HR has shared a new company policy document with you.",
      date: new Date("2025-04-18T11:45:00"),
    },
    {
      id: 5,
      type: "attendance",
      title: "Overtime Recorded",
      description:
        "Your overtime hours for last week have been recorded and approved.",
      date: new Date("2025-04-15T17:30:00"),
    },
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "leave":
        return "bg-green-100 text-green-800";
      case "payroll":
        return "bg-blue-100 text-blue-800";
      case "document":
        return "bg-purple-100 text-purple-800";
      case "performance":
        return "bg-amber-100 text-amber-800";
      case "attendance":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "leave":
        return "Leave";
      case "payroll":
        return "Payroll";
      case "document":
        return "Document";
      case "performance":
        return "Performance";
      case "attendance":
        return "Attendance";
      default:
        return "Other";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative pl-6 before:absolute before:left-2 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
          {activities.map((activity, _index) => (
            <div key={activity.id} className="mb-6 last:mb-0 relative">
              <div className="absolute -left-6 top-0 h-4 w-4 rounded-full border-2 border-white bg-gray-200"></div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{activity.title}</h4>
                    <Badge
                      variant="secondary"
                      className={`${getActivityIcon(activity.type)}`}
                    >
                      {getActivityLabel(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                </div>
                <div className="text-sm text-gray-500 sm:whitespace-nowrap">
                  {formatDate(activity.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
