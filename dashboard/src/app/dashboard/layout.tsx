import React from "react";
import Sidebar from "@/components/Sidebar";

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)', transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
