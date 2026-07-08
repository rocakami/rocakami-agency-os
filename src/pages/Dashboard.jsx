import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Search, BookOpen, FolderOpen, Users, Briefcase, Wrench, GraduationCap, Megaphone, ArrowRight, Clock, AlertCircle, Star, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/shared/StatusBadge";

const quickLinks = [
  { label: "SOP Library", path: "/sops", icon: BookOpen, color: "bg-navy-600 text-white" },
  { label: "Documents", path: "/documents", icon: FolderOpen, color: "bg-sky-400 text-white" },
  { label: "Onboarding", path: "/onboarding", icon: Users, color: "bg-emerald-500 text-white" },
  { label: "Client Delivery", path: "/client-delivery", icon: Briefcase, color: "bg-amber-500 text-white" },
  { label: "Tools", path: "/tools", icon: Wrench, color: "bg-purple-500 text-white" },
  { label: "Training", path: "/training", icon: GraduationCap, color: "bg-rose-500 text-white" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentSops, setRecentSops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState({});
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, ann, allTasks, projectList, docs, sops] = await Promise.all([
          base44.auth.me(),
          base44.entities.Announcement.list("-created_date", 3),
          base44.entities.Task.list("-due_date", 200),
          base44.entities.ClientProject.list("-created_date", 200),
          base44.entities.Document.list("-updated_date", 5),
          base44.entities.SOP.list("-updated_date", 5),
        ]);
        setUser(me);
        setAnnouncements(ann);
        const projectMap = {};
        projectList.forEach((p) => { projectMap[p.id] = p; });
        setProjects(projectMap);
        const userName = me?.full_name || "";
        const userTasks = userName
          ? allTasks.filter((t) => t.assigned_to && t.assigned_to.toLowerCase().includes(userName.toLowerCase()))
          : [];
        setTasks(userTasks.filter((t) => t.status !== "Done"));
        const doneCount = userTasks.filter((t) => t.status === "Done").length;
        setCompletionRate(userTasks.length > 0 ? Math.round((doneCount / userTasks.length) * 100) : 0);
        setRecentDocs(docs.filter((d) => !d.hidden));
        setRecentSops(sops.filter((s) => !s.hidden));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "Team Member";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3676] to-[#229ece] p-8 text-white">
        <div className="relative z-10">
          <p className="text-sky-200 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold mb-2">{firstName} 👋</h1>
          <p className="text-white/80 text-sm max-w-lg">Your agency command center. Stay organized, stay productive, stay ahead.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search SOPs, documents, training…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base rounded-xl border-border bg-white shadow-sm"
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-sky-500" /> Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path}>
                <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0 shadow-sm">
                  <CardContent className="flex flex-col items-center gap-3 py-5 px-3">
                    <div className={`w-11 h-11 rounded-xl ${link.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground text-center">{link.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-500" /> Announcements
            </h2>
            <Link to="/announcements" className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center text-muted-foreground text-sm">No announcements yet</CardContent></Card>
            ) : announcements.map((a) => (
              <Card key={a.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{a.title}</h3>
                        {a.priority === "High" && <StatusBadge status="High" />}
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-2">{a.content}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(a.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" /> Pending Tasks
            </h2>
          </div>
          <Card className="border-0 shadow-sm mb-3">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">My Task Completion</span>
                <span className="text-sm font-bold text-foreground">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </CardContent>
          </Card>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center text-muted-foreground text-sm">All caught up! 🎉</CardContent></Card>
            ) : tasks.map((t) => (
              <Card key={t.id} className="border-0 shadow-sm">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      {t.due_date && <p className="text-[11px] text-muted-foreground">Due {new Date(t.due_date).toLocaleDateString()}{projects[t.project_id]?.client_name ? ` • ${projects[t.project_id].client_name}` : ""}</p>}
                    </div>
                    <StatusBadge status={t.priority} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Updated */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent SOPs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" /> Recent SOPs
            </h2>
            <Link to="/sops" className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSops.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-6 text-center text-muted-foreground text-sm">No SOPs yet</CardContent></Card>
            ) : recentSops.map((s) => (
              <Link key={s.id} to={`/sops/${s.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3.5 px-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate leading-relaxed">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{s.category}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" /> Recent Documents
            </h2>
            <Link to="/documents" className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentDocs.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-6 text-center text-muted-foreground text-sm">No documents yet</CardContent></Card>
            ) : recentDocs.map((d) => (
              <Card key={d.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-3.5 px-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-relaxed">{d.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{d.category}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Start Here */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-sky-50 to-blue-50">
        <CardContent className="py-6 px-6">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold">Start Here — New to RocaKami?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">If you've just joined the team, these resources will help you get up to speed quickly.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/onboarding" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3676] text-white text-sm font-medium rounded-lg hover:bg-[#152c61] transition-colors">
              <Users className="w-4 h-4" /> Onboarding Hub
            </Link>
            <Link to="/training" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-foreground text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors">
              <GraduationCap className="w-4 h-4" /> Training Center
            </Link>
            <Link to="/tools" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-foreground text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors">
              <Wrench className="w-4 h-4" /> Tools & Access
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}