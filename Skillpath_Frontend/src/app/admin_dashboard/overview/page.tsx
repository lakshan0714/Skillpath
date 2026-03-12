"use client";

import SidebarLayout from "@/components/layout/admin_sidebar";


export default function CreatorDashboard() {

  return (
    <div className="flex min-h-screen">
      <SidebarLayout />
      <main className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      </main>
    </div>
  );
}
