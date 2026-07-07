import React from "react";
import { Heart, Target, Users, CheckSquare, Calendar, BookOpen, MessageSquare, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";

const sections = [
  {
    icon: Heart,
    title: "Welcome to RocaKami",
    color: "bg-rose-500",
    content: "Welcome to the RocaKami team! We're a premium digital agency specializing in building scalable systems for businesses. We're glad you're here."
  },
  {
    icon: Target,
    title: "Mission & Values",
    color: "bg-navy-600",
    content: "Our mission is to architect digital flow — creating seamless, automated business systems that help our clients scale. Our core values: Excellence, Ownership, Transparency, and Innovation."
  },
  {
    icon: Users,
    title: "Org Structure",
    color: "bg-sky-400",
    content: "RocaKami is organized into: Leadership, Sales & Growth, Client Success, Web Development, SEO & Content, Automation & CRM, and Operations. Each team has a lead and clear reporting lines."
  },
  {
    icon: CheckSquare,
    title: "Tools Access Checklist",
    color: "bg-emerald-500",
    items: ["Google Workspace (Gmail, Drive, Calendar)", "GoHighLevel (CRM)", "ClickUp (Project Management)", "Slack / Google Chat", "Canva (Design)", "WordPress access", "HubSpot", "QuickBooks / Wise"]
  },
  {
    icon: Calendar,
    title: "First Week Checklist",
    color: "bg-amber-500",
    items: ["Complete HR paperwork", "Set up all tool accounts", "Read company policies", "Review your role SOPs", "Meet your team lead", "Shadow a client call", "Complete onboarding training modules", "Set up your first weekly check-in"]
  },
  {
    icon: BookOpen,
    title: "Role-Specific Training Paths",
    color: "bg-purple-500",
    content: "Each role has a dedicated training path in the Training Center. After completing your first week checklist, navigate to Training and select your role to begin."
  },
  {
    icon: MessageSquare,
    title: "Communication Guidelines",
    color: "bg-blue-500",
    items: ["Use Slack/Chat for quick questions", "Use email for formal communication", "Tag team leads for escalations", "Weekly team standups every Monday", "All-hands meeting every first Friday", "Respond to messages within 4 business hours"]
  },
  {
    icon: Award,
    title: "Performance Expectations",
    color: "bg-teal-500",
    content: "We conduct 90-day reviews for new hires, then quarterly check-ins. Key metrics: task completion rate, client satisfaction scores, SOP adherence, and proactive communication."
  }
];

export default function Onboarding() {
  return (
    <div>
      <PageHeader title="Employee Onboarding Hub" description="Everything you need to get started at RocaKami" />

      <div className="grid sm:grid-cols-2 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="py-6 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${section.color} text-white flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base">{section.title}</h3>
                </div>
                {section.content && <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}