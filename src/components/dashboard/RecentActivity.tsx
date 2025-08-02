import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User, Activity, AlertCircle, CheckCircle2, Zap } from "lucide-react"

export function RecentActivity({ activities }: { activities: { id: number; action: string; time: string; user: string }[] }) {
  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes('registered') || action.toLowerCase().includes('added')) {
      return <User className="h-4 w-4 text-blue-500" />
    } else if (action.toLowerCase().includes('upgraded') || action.toLowerCase().includes('completed')) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    } else if (action.toLowerCase().includes('error') || action.toLowerCase().includes('warning')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    } else if (action.toLowerCase().includes('maintenance')) {
      return <Activity className="h-4 w-4 text-yellow-500" />
    }
    return <Zap className="h-4 w-4 text-purple-500" />
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="mt-0.5">
              {getActivityIcon(activity.action)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.action}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {activity.time} • {activity.user}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
