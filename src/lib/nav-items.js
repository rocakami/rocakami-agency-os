import {
  LayoutDashboard, BookOpen, FolderOpen, Users, Briefcase, UserCheck,
  Building2, Wrench, GraduationCap, Megaphone, CheckSquare
} from "lucide-react";

export const DEFAULT_NEW_USER_PATHS = '/,/announcements,/sops,/documents,/onboarding,/tools,/training,/my-tasks';

export const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "My Tasks", path: "/my-tasks", icon: CheckSquare },
  { label: "SOP Library", path: "/sops", icon: BookOpen },
  { label: "Documents", path: "/documents", icon: FolderOpen },
  { label: "Onboarding", path: "/onboarding", icon: Users },
  { label: "Client Delivery", path: "/client-delivery", icon: Briefcase },
  { label: "Client Directory", path: "/clients", icon: Building2 },
  { label: "Contractors", path: "/contractors", icon: UserCheck },
  { label: "Tools Directory", path: "/tools", icon: Wrench },
  { label: "Training", path: "/training", icon: GraduationCap },
  { label: "Announcements", path: "/announcements", icon: Megaphone },
];