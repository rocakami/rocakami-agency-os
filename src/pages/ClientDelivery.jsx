import React from "react";
import { PhoneCall, Search, FileText, UserPlus, Rocket, BarChart3, MessageCircle, CheckCircle, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";

const workflows = [
  { icon: UserPlus, title: "New Client Intake", description: "Initial client information gathering, contract signing, and system setup. Complete the intake form, verify payment details, and create client folders.", step: 1, color: "bg-navy-600" },
  { icon: PhoneCall, title: "Discovery Call Process", description: "Pre-call research, call structure, note-taking template, and post-call follow-up. Record findings in CRM within 24 hours.", step: 2, color: "bg-sky-400" },
  { icon: FileText, title: "Proposal Creation", description: "Use the proposal template, customize scope and pricing, get internal approval, and send via DocuSign or email.", step: 3, color: "bg-indigo-500" },
  { icon: Search, title: "Client Onboarding", description: "Welcome email, tool access setup, kickoff meeting scheduling, shared Drive folder creation, and ClickUp project board setup.", step: 4, color: "bg-emerald-500" },
  { icon: Rocket, title: "Project Kickoff", description: "Internal briefing, timeline confirmation, milestone setup, communication preferences, and first deliverable planning.", step: 5, color: "bg-amber-500" },
  { icon: BarChart3, title: "Weekly Reporting", description: "Compile metrics, update dashboards, prepare client-facing report, schedule review call, and document action items.", step: 6, color: "bg-purple-500" },
  { icon: MessageCircle, title: "Client Communication", description: "Response SLAs, escalation procedures, meeting cadence, status update format, and communication channel guidelines.", step: 7, color: "bg-blue-500" },
  { icon: CheckCircle, title: "Project Closure", description: "Final deliverable review, client sign-off, documentation archival, testimonial request, and internal retrospective.", step: 8, color: "bg-teal-500" },
  { icon: LogOut, title: "Offboarding", description: "Access revocation, final invoice, file handover, exit survey, and CRM status update.", step: 9, color: "bg-rose-500" },
];

export default function ClientDelivery() {
  return (
    <div>
      <PageHeader title="Client Delivery Hub" description="Internal workflows from intake to project closure" />

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />
        <div className="space-y-5">
          {workflows.map((w) => {
            const Icon = w.icon;
            return (
              <div key={w.step} className="relative sm:pl-16">
                <div className={`hidden sm:flex absolute left-0 w-12 h-12 rounded-xl ${w.color} text-white items-center justify-center font-bold text-lg z-10`}>
                  {w.step}
                </div>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-5 px-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`sm:hidden w-8 h-8 rounded-lg ${w.color} text-white flex items-center justify-center text-sm font-bold`}>{w.step}</div>
                      <Icon className="w-5 h-5 text-muted-foreground hidden sm:block" />
                      <h3 className="font-bold text-base">{w.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed sm:ml-8">{w.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}