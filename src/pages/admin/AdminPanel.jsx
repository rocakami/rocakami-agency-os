import React, { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import AdminSOPs from "@/components/admin/AdminSOPs";
import AdminDocuments from "@/components/admin/AdminDocuments";
import AdminContractors from "@/components/admin/AdminContractors";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminTools from "@/components/admin/AdminTools";
import AdminTraining from "@/components/admin/AdminTraining";
import AdminPermissions from "@/components/admin/AdminPermissions";
import AdminNavCategories from "@/components/admin/AdminNavCategories";

export default function AdminPanel() {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <a href="https://www.rocakami.com/" target="_blank" rel="noopener noreferrer">
            <Globe className="w-4 h-4" /> ROCAKAMI Website <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
      <PageHeader title="Admin Panel" description="Manage content, staff, and settings" />

      <Tabs defaultValue="sops" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="sops" className="text-xs">SOPs</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs">Announcements</TabsTrigger>
          <TabsTrigger value="contractors" className="text-xs">Contractors</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
          <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs">Permissions</TabsTrigger>
          <TabsTrigger value="nav-categories" className="text-xs">Nav Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="sops"><AdminSOPs /></TabsContent>
        <TabsContent value="documents"><AdminDocuments /></TabsContent>
        <TabsContent value="announcements"><AdminAnnouncements /></TabsContent>
        <TabsContent value="contractors"><AdminContractors /></TabsContent>
        <TabsContent value="tools"><AdminTools /></TabsContent>
        <TabsContent value="training"><AdminTraining /></TabsContent>
        <TabsContent value="permissions"><AdminPermissions /></TabsContent>
        <TabsContent value="nav-categories"><AdminNavCategories /></TabsContent>
      </Tabs>
    </div>
  );
}