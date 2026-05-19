import { 
  Users, MousePointerClick, Clock, ArrowDownRight, 
  Workflow, Zap, Mail, MessageSquare, Target, Settings, BrainCircuit
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { SeoHead } from "../seo/SeoHead"
import { usePageSeo } from "../seo/usePageSeo"

export function DashboardPage() {
  const seo = usePageSeo()
  return (
    <>
    <SeoHead seo={seo} />
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white hidden md:block">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-lg tracking-tight">Automation CRM</span>
        </div>
        <nav className="p-4 space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <Workflow className="w-4 h-4" /> Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="w-4 h-4" /> Audience
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BrainCircuit className="w-4 h-4" /> AI Agents
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="w-4 h-4" /> Setup
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
          
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Campaign Overview</h1>
              <p className="text-sm text-slate-500">Real-time engagement and agent activity.</p>
            </div>
            <Button className="gap-2">
              <Zap className="w-4 h-4" /> New Workflow
            </Button>
          </header>

          {/* Visitor Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Page Visits", value: "24,592", trend: "+12.5%", isUp: true, icon: Users },
              { label: "Avg Time Spent", value: "4m 12s", trend: "+2.1%", isUp: true, icon: Clock },
              { label: "Book Demo Clicks", value: "1,405", trend: "+18.2%", isUp: true, icon: MousePointerClick },
              { label: "Checkout Abandonment", value: "12%", trend: "-4.3%", isUp: false, icon: ArrowDownRight },
            ].map((stat, i) => (
              <Card key={i} className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                  <stat.icon className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs mt-1 font-medium ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI-Driven Lead Scoring Table */}
            <Card className="col-span-1 lg:col-span-2 border-slate-200">
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>AI-scored based on engagement intent.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Last Event</th>
                        <th className="px-4 py-3 font-medium">Intent Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { user: "alex@example.com", event: "Added to Cart", intent: "High", color: "bg-green-100 text-green-800" },
                        { user: "sarah@example.com", event: "Book Demo Click", intent: "High", color: "bg-green-100 text-green-800" },
                        { user: "mike@example.com", event: "Read Free Chapter", intent: "Medium", color: "bg-yellow-100 text-yellow-800" },
                        { user: "emily@example.com", event: "Page Visit", intent: "Low", color: "bg-slate-100 text-slate-800" },
                      ].map((lead, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{lead.user}</td>
                          <td className="px-4 py-3 text-slate-600">{lead.event}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${lead.color}`}>
                              {lead.intent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Workflow Automation */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Active Agents</CardTitle>
                <CardDescription>Triggered automated flows.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "Email Agent", status: "Running", desc: "Awareness workflow", icon: Mail, color: "text-blue-500 bg-blue-50" },
                    { name: "Message Agent", status: "Running", desc: "Abandoned cart recovery", icon: MessageSquare, color: "text-green-500 bg-green-50" },
                    { name: "Ads Campaign Agent", status: "Learning", desc: "Facebook/Google triggers", icon: Target, color: "text-purple-500 bg-purple-50" },
                  ].map((agent, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${agent.color}`}>
                        <agent.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{agent.name}</h4>
                        <p className="text-xs text-slate-500">{agent.desc}</p>
                      </div>
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
    </>
  )
}
