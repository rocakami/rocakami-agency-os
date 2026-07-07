import {
  Circle, LayoutDashboard, BookOpen, FolderOpen, Users, Briefcase, UserCheck,
  Building2, Wrench, GraduationCap, Megaphone, FileText, Settings,
  Calendar, ClipboardList, CheckSquare, Mail, Phone, MessageSquare,
  BarChart3, DollarSign, Clock, Star, Bell, Search, Home, Heart,
  Shield, Zap, Globe, Database, Folder, Edit, Eye, Link as LinkIcon
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard, BookOpen, FolderOpen, Users, Briefcase, UserCheck,
  Building2, Wrench, GraduationCap, Megaphone, FileText, Settings,
  Calendar, ClipboardList, CheckSquare, Mail, Phone, MessageSquare,
  BarChart3, DollarSign, Clock, Star, Bell, Search, Home, Heart,
  Shield, Zap, Globe, Database, Folder, Edit, Eye, Link: LinkIcon
};

export const getNavIcon = (iconName) => ICON_MAP[iconName] || Circle;

export const ICON_OPTIONS = Object.keys(ICON_MAP);