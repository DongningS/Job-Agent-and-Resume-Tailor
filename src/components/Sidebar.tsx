import React from "react";
import { Sparkles, Briefcase, FileText, Compass, BarChart, Settings, LayoutDashboard, Cpu, Layers } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resumeLoaded: boolean;
  targetJobSelected: boolean;
  selectedJobTitle?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  resumeLoaded,
  targetJobSelected,
  selectedJobTitle,
}: SidebarProps) {
  const links = [
    { id: "dashboard", label: "Executive Suite", icon: LayoutDashboard },
    { id: "resume", label: "Baseline Resume", icon: FileText, badge: resumeLoaded ? "Loaded" : undefined, badgeColor: "bg-green-500/10 text-green-300 border border-green-500/20" },
    { id: "jobs", label: "Crawl Job Postings", icon: Compass, badge: targetJobSelected ? "Target Selected" : undefined, badgeColor: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" },
    { id: "tailor", label: "Optimize Tailoring", icon: Sparkles, disabled: !resumeLoaded || !targetJobSelected },
    { id: "audit", label: "Expert API Matrix", icon: Cpu },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-950/20 backdrop-blur-2xl border-b lg:border-b-0 lg:border-r border-white/10 lg:h-[calc(100vh-64px)] p-6 flex flex-col justify-between shrink-0" id="sidebar-navigation">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Control Station</span>
          <p className="text-xs text-slate-300 mt-1">Full-stack suite for matching and tailoring</p>
        </div>

        <nav className="space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none gap-2 lg:gap-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isSelected = activeTab === link.id;
            const isDisabled = link.disabled;

            return (
              <button
                key={link.id}
                onClick={() => !isDisabled && setActiveTab(link.id)}
                disabled={isDisabled}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 transition-colors cursor-pointer shrink-0 sm:shrink border ${
                  isDisabled
                    ? "opacity-30 cursor-not-allowed text-slate-500 bg-transparent border-transparent"
                    : isSelected
                    ? "bg-white/10 text-white border-white/15 shadow-md shadow-slate-950/20"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 transition-colors ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </div>

                {link.badge && (
                  <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${link.badgeColor}`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target summary tooltip cards on footer of sidebar */}
      {targetJobSelected && selectedJobTitle && (
        <div className="hidden lg:block border border-white/10 rounded-xl p-3.5 bg-white/5 backdrop-blur-xl">
          <span className="text-[9px] uppercase font-mono tracking-wider text-cyan-400 font-bold block mb-1">Active Hunt Focus</span>
          <p className="text-[11px] font-semibold text-slate-200 line-clamp-2 leading-snug">{selectedJobTitle}</p>
        </div>
      )}
    </aside>
  );
}
