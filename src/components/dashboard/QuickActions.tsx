import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function QuickActions({ actions }: { actions: { title: string; icon: string; path: string }[] }) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        <Rocket className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(action.path)}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs text-center">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
