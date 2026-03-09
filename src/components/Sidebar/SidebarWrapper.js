/* eslint-disable */
import React from "react";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

/**
 * SidebarWrapper - Renders the appropriate sidebar based on screen size
 * - Desktop (md and up): Shows the collapsible desktop sidebar
 * - Mobile (below md): Shows the mobile drawer sidebar with backdrop
 * 
 * Both components are rendered but visibility is controlled via CSS:
 * - Sidebar.js uses `hidden md:block`
 * - MobileSidebar.js is only visible on mobile (uses no md: prefix)
 */
export default function SidebarWrapper() {
  return (
    <>
      {/* Mobile Sidebar - visible only on screens below md (768px) */}
      <div className="md:hidden">
        <MobileSidebar />
      </div>
      
      {/* Desktop Sidebar - visible only on md screens and above */}
      <Sidebar />
    </>
  );
}
