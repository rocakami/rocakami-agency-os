import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import AdminSOPs from "@/components/admin/AdminSOPs";
import AdminDocuments from "@/components/admin/AdminDocuments";
import AdminContractors from "@/components/admin/AdminContractors";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminTools from "@/components/admin/AdminTools";
import AdminTraining from "@/components/admin/AdminTraining";
import AdminOnboarding from "@/components/admin/AdminOnboarding";
import AdminPermissions from "@/components/admin/AdminPermissions";
import AdminNavCategories from "@/components/admin/AdminNavCategories";
import AdminPrefixes from "@/components/admin/AdminPrefixes";
import AdminSopCategories from "@/components/admin/AdminSopCategories";

export default function AdminPanel() {
  return (
    <div>
      <PageHeader title="Admin Panel" description="Manage content, staff, and settings" />

      <Tabs defaultValue="sops" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="sops" className="text-xs">SOPs</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs">Announcements</TabsTrigger>
          <TabsTrigger value="contractors" className="text-xs">Contractors</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
          <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
          <TabsTrigger value="onboarding" className="text-xs">Onboarding</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs">Permissions</TabsTrigger>
          <TabsTrigger value="nav-categories" className="text-xs">Nav Categories</TabsTrigger>
          <TabsTrigger value="prefixes" className="text-xs">Dept Prefixes</TabsTrigger>
        </TabsList>

        <TabsContent value="sops"><AdminSOPs /></TabsContent>
        <TabsContent value="documents"><AdminDocuments /></TabsContent>
        <TabsContent value="announcements"><AdminAnnouncements /></TabsContent>
        <TabsContent value="contractors"><AdminContractors /></TabsContent>
        <TabsContent value="tools"><AdminTools /></TabsContent>
        <TabsContent value="training"><AdminTraining /></TabsContent>
        <TabsContent value="onboarding"><AdminOnboarding /></TabsContent>
        <TabsContent value="permissions"><AdminPermissions /></TabsContent>
        <TabsContent value="nav-categories"><AdminNavCategories /></TabsContent>
        <TabsContent value="prefixes">
          <div className="space-y-8">
            <AdminPrefixes />
            <AdminSopCategories />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}