import React from "react";
import Topbar from "./Topbar";

/**
 * PageLayout component - Wraps all authenticated pages with consistent structure
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {string} props.mainClassName - Optional custom className for main container
 *                                        Defaults to "flex-1 px-8 py-6"
 */
function PageLayout({ children, mainClassName = "flex-1 px-8 py-6" }) {
  return (
    <div className="min-h-screen bg-[#E5DCE7]">
      <Topbar />
      <main className={mainClassName}>
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
