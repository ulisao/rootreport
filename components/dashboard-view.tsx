"use client"

import Link from "next/link"
import { FolderKanban, AlertTriangle, AlertCircle, FileText, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const kpiData = [
  {
    title: "Active Projects",
    value: "8",
    change: "+2 this month",
    icon: FolderKanban,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Open Vulnerabilities",
    value: "47",
    change: "-12 from last week",
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Critical Issues",
    value: "5",
    change: "Requires attention",
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Reports Generated",
    value: "23",
    change: "+5 this month",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
]

const recentActivity = [
  {
    user: "Sarah Chen",
    avatar: "SC",
    action: "added a finding",
    target: "SQL Injection in Login Form",
    project: "E-commerce Audit",
    time: "5 minutes ago",
  },
  {
    user: "Mike Johnson",
    avatar: "MJ",
    action: "marked as fixed",
    target: "XSS in Search",
    project: "Banking Portal",
    time: "1 hour ago",
  },
  {
    user: "Emily Davis",
    avatar: "ED",
    action: "generated report for",
    target: "",
    project: "Healthcare App",
    time: "2 hours ago",
  },
  {
    user: "John Doe",
    avatar: "JD",
    action: "commented on",
    target: "IDOR Vulnerability",
    project: "API Gateway",
    time: "3 hours ago",
  },
]

const activeProjects = [
  {
    id: "1",
    name: "E-commerce Security Audit",
    client: "TechCorp Inc.",
    status: "In Progress",
    progress: 65,
    dueDate: "Jan 25, 2026",
  },
  {
    id: "2",
    name: "Banking Portal Pentest",
    client: "SecureBank Ltd.",
    status: "Review",
    progress: 90,
    dueDate: "Jan 20, 2026",
  },
  {
    id: "3",
    name: "Healthcare App Assessment",
    client: "MedTech Solutions",
    status: "In Progress",
    progress: 40,
    dueDate: "Feb 1, 2026",
  },
  {
    id: "4",
    name: "API Gateway Security",
    client: "CloudFirst",
    status: "Starting",
    progress: 10,
    dueDate: "Feb 15, 2026",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    case "Review":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    case "Starting":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    case "Completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }
}

export function DashboardView() {
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Welcome back, John</h1>
          <p className="text-zinc-400 mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">New Project</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{kpi.title}</CardTitle>
              <div className={`h-8 w-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">{kpi.value}</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-zinc-100">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-500">Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/.jpg?height=32&width=32&query=${activity.user} avatar`} />
                    <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300">
                      <span className="font-medium text-zinc-100">{activity.user}</span> {activity.action}{" "}
                      {activity.target && <span className="font-medium text-zinc-100">{activity.target}</span>} in{" "}
                      <span className="text-emerald-400">{activity.project}</span>
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects Table */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100">Active Projects</CardTitle>
              <CardDescription className="text-zinc-500">Your ongoing security assessments</CardDescription>
            </div>
            <Link href="/dashboard/projects">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {activeProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-2">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-sm font-medium text-zinc-100 hover:text-emerald-400 transition-colors"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-sm text-zinc-400">{project.client}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="h-2 w-20 bg-zinc-800" />
                          <span className="text-xs text-zinc-500">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-zinc-400">{project.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
