// components/layouts/SidebarLayout.tsx
'use client';
import Sidebar, { SidebarItem } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import React from "react";
import { FaHome, FaUpload, FaFolderOpen, FaUser, FaCog, FaQuestionCircle, FaSignOutAlt, FaIdBadge } from "react-icons/fa";

export default function SidebarLayout() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.replace("/auth/login");
    } catch (err) {
      router.replace("/auth/login");
    }
  };
    const sidebarItems: SidebarItem[] = [
    { icon: <FaHome />, label: "Overview", href: "/super_admin_dashboard/overview" },
    { icon: <FaUpload />, label: "Resources", href: "/super_admin_dashboard/resources" },
    { icon: <FaUser />, label: "User Profile", href: "#" },
    { icon: <FaIdBadge />, label: "Account", href: "#" },
    { icon: <FaCog />, label: "Settings", href: "#" },
    { icon: <FaQuestionCircle />, label: "Help", href: "#" },
    { icon: <FaSignOutAlt />, label: "Logout", onClick: handleLogout },
  ];


  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={sidebarItems}
        userName="ByeWind"
        userAvatarUrl="/user.svg"
        logoUrl="/images/m3_description_logo.png"
      />
    </div>
  );
}














