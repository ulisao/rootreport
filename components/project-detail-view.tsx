"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VulnerabilityDrawer } from "@/components/vulnerability-drawer"

const vulnerabilities = [
  {
    id: "vuln-1",
    title: "SQL Injection in Login Form",
    severity: "Critical",
    status: "Open",
    assignee: { name: "Sarah Chen", avatar: "SC" },
    cvss: 9.8,
    createdAt: "Jan 10, 2026",
  },
  {
    id: "vuln-2",
    title: "Cross-Site Scripting (XSS) in Search",
    severity: "High",
    status: "Fixed",
    assignee: { name: "Mike Johnson", avatar: "MJ" },
    cvss: 7.5,
    createdAt: "Jan 8, 2026",
  },
  {
    id: "vuln-3",
    title: "Insecure Direct Object Reference (IDOR)",
    severity: "High",
    status: "Open",
    assignee: { name: "John Doe", avatar: "JD" },
    cvss: 7.2,
    createdAt: "Jan 12, 2026",
  },
  {
    id: "vuln-4",
    title: "Missing Rate Limiting on API",
    severity: "Medium",
    status: "Retest",
    assignee: { name: "Emily Davis", avatar: "ED" },
    cvss: 5.3,
    createdAt: "Jan 9, 2026",
  },
  {
    id: "vuln-5",
    title: "Information Disclosure in Error Messages",
    severity: "Low",
    status: "Open",
    assignee: { name: "Sarah Chen", avatar: "SC" },
    cvss: 3.1,
    createdAt: "Jan 11, 2026",
  },
]

const assets = [
  { id: "1", name: "api.example.com", type: "API", status: "Tested" },
  { id: "2", name: "app.example.com", type: "Web App", status: "In Progress" },
  { id: "3", name: "admin.example.com", type: "Web App", status: "Pending" },
  { id: "4", name: "192.168.1.0/24", type: "Network", status: "Tested" },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "bg-red-500 text-white"
    case "High":
      return "bg-orange-500 text-white"
    case "Medium":
      return "bg-yellow-500 text-black"
    case "Low":
      return "bg-blue-500 text-white"
    default:
      return "bg-zinc-500 text-white"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "border-red-500/30 text-red-400"
    case "Fixed":
      return "border-emerald-500/30 text-emerald-400"
    case "Retest":
      return "border-yellow-500/30 text-yellow-400"
    default:
      return "border-zinc-500/30 text-zinc-400"
  }
}

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const [selectedVulns, setSelectedVulns] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedVuln, setSelectedVuln] = useState<(typeof vulnerabilities)[0] | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const toggleVuln = (id: string) => {
    setSelectedVulns((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedVulns.length === vulnerabilities.length) {
      setSelectedVulns([])
    } else {
      setSelectedVulns(vulnerabilities.map((v) => v.id))
    }
  }

  const openVulnerability = (vuln: (typeof vulnerabilities)[0]) => {
    setSelectedVuln(vuln)
    setDrawerOpen(true)
  }

  const filteredVulnerabilities = vulnerabilities.filter((vuln) => {
    if (severityFilter !== "all" && vuln.severity !== severityFilter) return false
    if (statusFilter !== "all" && vuln.status !== statusFilter) return false
    return true
  })

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">E-commerce Security Audit</h1>
            <p className="text-zinc-400 mt-1">TechCorp Inc. • Due Jan 25, 2026</p>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              setSelectedVuln(null)
              setDrawerOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Finding
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vulnerabilities" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="vulnerabilities"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              Vulnerabilities
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
              Assets
            </TabsTrigger>
            <TabsTrigger value="report" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
              Report Preview
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Total Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">27</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Critical</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">2</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">High</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500">5</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Fixed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-500">12</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-500">Client</label>
                    <p className="text-zinc-100">TechCorp Inc.</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-500">Assessment Type</label>
                    <p className="text-zinc-100">Web Application Penetration Test</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-500">Start Date</label>
                    <p className="text-zinc-100">January 5, 2026</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-500">End Date</label>
                    <p className="text-zinc-100">January 25, 2026</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search vulnerabilities..."
                  className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px] bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all" className="text-zinc-300">
                    All Severities
                  </SelectItem>
                  <SelectItem value="Critical" className="text-zinc-300">
                    Critical
                  </SelectItem>
                  <SelectItem value="High" className="text-zinc-300">
                    High
                  </SelectItem>
                  <SelectItem value="Medium" className="text-zinc-300">
                    Medium
                  </SelectItem>
                  <SelectItem value="Low" className="text-zinc-300">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all" className="text-zinc-300">
                    All Status
                  </SelectItem>
                  <SelectItem value="Open" className="text-zinc-300">
                    Open
                  </SelectItem>
                  <SelectItem value="Fixed" className="text-zinc-300">
                    Fixed
                  </SelectItem>
                  <SelectItem value="Retest" className="text-zinc-300">
                    Retest
                  </SelectItem>
                </SelectContent>
              </Select>
              {selectedVulns.length > 0 && (
                <Button variant="outline" className="border-zinc-700 text-zinc-300 bg-transparent">
                  Bulk Actions ({selectedVulns.length})
                </Button>
              )}
            </div>

            {/* Vulnerabilities Table */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-3 px-4 w-12">
                          <Checkbox
                            checked={selectedVulns.length === vulnerabilities.length}
                            onCheckedChange={toggleAll}
                            className="border-zinc-600"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          CVSS
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Assignee
                        </th>
                        <th className="text-left py-3 px-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredVulnerabilities.map((vuln) => (
                        <tr key={vuln.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedVulns.includes(vuln.id)}
                              onCheckedChange={() => toggleVuln(vuln.id)}
                              className="border-zinc-600"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openVulnerability(vuln)}
                              className="text-sm font-medium text-zinc-100 hover:text-emerald-400 transition-colors text-left"
                            >
                              {vuln.title}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getStatusColor(vuln.status)}>
                              {vuln.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-zinc-400">{vuln.cvss}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={`/.jpg?height=24&width=24&query=${vuln.assignee.name} avatar`}
                                />
                                <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                                  {vuln.assignee.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-zinc-400">{vuln.assignee.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                <DropdownMenuItem
                                  className="text-zinc-300 focus:bg-zinc-800"
                                  onClick={() => openVulnerability(vuln)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800">
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400 focus:bg-zinc-800">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">In-Scope Assets</CardTitle>
                <CardDescription className="text-zinc-500">
                  Systems and applications included in this assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-zinc-100">{asset.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                              {asset.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-zinc-400">{asset.status}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Preview Tab */}
          <TabsContent value="report" className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-zinc-100">Report Preview</CardTitle>
                  <CardDescription className="text-zinc-500">Preview and generate your final report</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
                    Preview PDF
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Generate Report</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-zinc-800 rounded-lg p-8 bg-zinc-950 min-h-[400px]">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center pb-6 border-b border-zinc-800">
                      <h2 className="text-2xl font-bold text-zinc-100">Security Assessment Report</h2>
                      <p className="text-zinc-400 mt-2">E-commerce Security Audit</p>
                      <p className="text-sm text-zinc-500">TechCorp Inc. • January 2026</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Executive Summary</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        This security assessment identified 27 vulnerabilities across the target application. Of these,
                        2 are rated as Critical severity, 5 as High severity, 8 as Medium severity, and 12 as Low
                        severity. Immediate remediation is recommended for all Critical and High severity findings.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Findings Summary</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-red-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-red-500">2</div>
                          <div className="text-xs text-zinc-500">Critical</div>
                        </div>
                        <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-orange-500">5</div>
                          <div className="text-xs text-zinc-500">High</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-500">8</div>
                          <div className="text-xs text-zinc-500">Medium</div>
                        </div>
                        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-blue-500">12</div>
                          <div className="text-xs text-zinc-500">Low</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <VulnerabilityDrawer open={drawerOpen} onOpenChange={setDrawerOpen} vulnerability={selectedVuln} />
    </>
  )
}
