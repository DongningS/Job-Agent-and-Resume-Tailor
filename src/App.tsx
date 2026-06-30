import React, { useState, useEffect } from "react";
import { Briefcase, Key, Compass, Cpu, FileText, LayoutDashboard, LifeBuoy, Sparkles, Clock, ShieldAlert } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ResumeManager from "./components/ResumeManager";
import JobSearch from "./components/JobSearch";
import TailorPanel from "./components/TailorPanel";
import ComparisonPanel from "./components/ComparisonPanel";
import { JobListing } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Shared CV states
  const [resumeText, setResumeText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parsedProfile, setParsedProfile] = useState<any>(null);
  
  // Active crawled job state
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Health and API checks
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [serverLoading, setServerLoading] = useState<boolean>(true);

  useEffect(() => {
    // Audit backend connection & API key status
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setApiConfigured(data.apiConfigured);
        setServerLoading(false);
      })
      .catch((err) => {
        console.error("Health check failure:", err);
        setApiConfigured(false);
        setServerLoading(false);
      });
  }, []);

  const handleSelectJobForTailoring = (job: JobListing) => {
    setSelectedJob(job);
    setActiveTab("tailor");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-white" id="main-application-frame">
      {/* Absolute Background Ambient Blur Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[130px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[650px] h-[650px] bg-cyan-950/20 rounded-full blur-[130px] opacity-65"></div>
      </div>

      {/* Top Professional Glass Header Bar */}
      <header className="h-16 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm relative" id="top-navigation-bar">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20">
            <Briefcase className="h-4 w-4 text-slate-950" />
          </div>
          <div>
            <span className="font-sans font-bold tracking-tight text-white text-base">Job Agent & Resume Tailor</span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded ml-2.5">GROUNDED LLM v2.1</span>
          </div>
        </div>

        {/* Global States, Clocks, Secrets Check */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {/* UTC Clock Tracker */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-300 font-mono text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-xl backdrop-blur-md">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>UTC 2026-06-23</span>
          </div>

          {/* Secret Key Badge Indicator */}
          {serverLoading ? (
            <span className="text-[11px] text-slate-400 font-mono">Checking Secrets...</span>
          ) : apiConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-500/10 text-green-400 border border-green-500/30 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
              <span>Gemini Key Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Preview Mode</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Core Body Space */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
          resumeLoaded={!!resumeText}
          targetJobSelected={!!selectedJob}
          selectedJobTitle={selectedJob?.title}
        />

        {/* Dynamic Panel Canvas Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Secret Key Setup notice if missing */}
          {!apiConfigured && !serverLoading && activeTab !== "audit" && (
            <div className="mb-6 p-4 border border-amber-500/20 bg-amber-500/5 backdrop-blur-md rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-amber-400 block mb-0.5">Google Gemini API Key is Not Configured</span>
                  The agent is running on sandboxed fallback modes. To unlock full real-time job indices discovery and tailoring summaries, go to the top Settings &gt; Secrets panel in AI Studio and enter GEMINI_API_KEY.
                </div>
              </div>
            </div>
          )}

          {/* Conditional Screen Mapping */}
          {activeTab === "dashboard" && (
            <Dashboard
              resumeText={resumeText}
              fileName={fileName}
              hasSelectedJob={!!selectedJob}
              selectedJobTitle={selectedJob?.title}
              selectedJobCompany={selectedJob?.company}
              setActiveTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "resume" && (
            <ResumeManager
              resumeText={resumeText}
              setResumeText={setResumeText}
              fileName={fileName}
              setFileName={setFileName}
              parsedProfile={parsedProfile}
              setParsedProfile={setParsedProfile}
            />
          )}

          {activeTab === "jobs" && (
            <JobSearch
              onSelectJob={handleSelectJobForTailoring}
              selectedJobId={selectedJob?.id}
            />
          )}

          {activeTab === "tailor" && (
            <TailorPanel
              resumeText={resumeText}
              selectedJob={selectedJob}
            />
          )}

          {activeTab === "audit" && (
            <ComparisonPanel />
          )}
        </main>
      </div>

      {/* Humble Footer */}
      <footer className="h-10 border-t border-white/5 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
        <span>Job Agent & Resume Tailor © 2026</span>
        <span>Secure server-side API Gateway • Frosted Glass Theme</span>
      </footer>
    </div>
  );
}
