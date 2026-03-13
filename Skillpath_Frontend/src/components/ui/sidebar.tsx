'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SidebarProps {
  items: SidebarItem[];
  userName: string;
  userAvatarUrl?: string;
  logoUrl?: string;
  logoText?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  userName,
  userAvatarUrl = "/user.svg",
  logoUrl = "/images/m3_description_logo.png",
}) => {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-full w-64 bg-blue-50 py-2 justify-between"
      style={{ minHeight: "100vh" }}
    >
      <div>
        {/* Logo Section */}
        {/* <div className="flex flex-col items-center">
          <div className="flex items-center mt-[-20px]">
            <Image src={logoUrl} alt="Logo" width={146} height={47} />
          </div>
        </div> */}

        {/* Navigation Items */}
        <nav className="flex flex-col ml-[20px] gap-2 mt-[20px]">
          {items.map((item) => {
            const isActive = item.href && pathname.startsWith(item.href);
            if (item.href) {
              // Use Link for navigation to avoid full page reload
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 w-[190px] px-3 py-4 rounded-2xl transition-colors ${
                    isActive
                      ? "bg-blue-100 text-black"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </Link>
              );
            } else {
              // If no href, use div with onClick
              return (
                <div
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-3 w-[208px] px-3 py-4 rounded-xl transition-colors hover:bg-gray-100 text-gray-700"
                  style={{ cursor: item.onClick ? "pointer" : "default" }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </div>
              );
            }
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      {/* <div className="flex items-center gap-2 px-4 py-3">
        <Image
          src={userAvatarUrl}
          alt=""
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-sm text-gray-700">{userName}</span>
      </div> */}
    </aside>
  );
};

export default Sidebar;
