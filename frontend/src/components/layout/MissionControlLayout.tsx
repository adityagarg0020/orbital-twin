import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const MissionControlLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 font-sans">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-grid-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
