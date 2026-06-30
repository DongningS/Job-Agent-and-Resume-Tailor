import React from "react";
import { Sparkles, ArrowRight, CheckCircle, FileText, Search, Play, Award, Layers, Terminal, Compass, Zap } from "lucide-react";

interface DashboardProps {
  resumeText: string;
  fileName: string;
  hasSelectedJob: boolean;
  selectedJobTitle?: string;
  selectedJobCompany?: string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({
  resumeText,
  fileName,
  hasSelectedJob,
  selectedJobTitle,
  selectedJobCompany,
  setActiveTab,
}: DashboardProps) {
  
  const isStep1Done = !!resumeText;
  const isStep2Done = hasSelectedJob;

  return (
    <div className="space-y-6 animate-fade-in text-slate-200" id="dashboard-module">
      {/* Prime Hero Panel with Frosted Glow */}
      <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl shadow-black/20">
        {/* Absolute Background Accent Vector */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none rounded-r-3xl"></div>
        
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full w-fit border border-cyan-500/20">
            <Sparkles className="h-3 w-3 animate-pulse" /> Zero-Config Grounded Job Agent Suite
          </div>
          <h1 className="text-2xl md:text-3.5xl font-display font-bold tracking-tight leading-tight text-white">
            Transform Your Job Hunt with <span className="text-cyan-400">Live Search Grounding</span>
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl">
            Upload your base resume, search or filter active job index postings live with Google Grounding, and auto-generate meticulously tailored documents optimized for search keywords.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("jobs")}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-500/15"
            >
              Crawl Active Jobs <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className="px-5 py-2.5 bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              Evaluate API Comparisons
            </button>
          </div>
        </div>
      </div>

      {/* Structured 3-Step Flow Pipeline with Frosted Glass Containers */}
      <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl relative">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Job Agent Pipeline Execution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Step 1 Card */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl transition-all ${
            isStep1Done ? "border-green-500/30 bg-green-500/5 shadow-inner" : "border-white/10 bg-white/5"
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-1 px-2.5 font-mono text-[10px] font-bold rounded-lg bg-slate-950/60 text-slate-450 border border-white/5">Step 1</span>
                {isStep1Done ? <CheckCircle className="h-5 w-5 text-green-400" /> : <div className="h-5 w-5 rounded-full border border-white/20"></div>}
              </div>
              <h3 className="text-sm font-bold text-white font-display">Setup Resumes</h3>
              <p className="text-slate-300 text-[11px] mt-2.5 leading-relaxed">
                Upload your base <code className="bg-slate-950/40 text-cyan-300 px-1.5 py-0.5 rounded font-mono border border-white/5 text-[10.5px]">resume.docx</code> file. We parse it to map your baseline accomplishments and technologies.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab("resume")}
              className="mt-5 text-xs font-bold text-cyan-400 flex items-center gap-1.5 hover:gap-2.5 transition-all text-left w-fit cursor-pointer group"
            >
              {isStep1Done ? `Rename/Substitute (${fileName})` : "Configure Baseline"} <ArrowRight className="h-3.5 w-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </button>
          </div>

          {/* Step 2 Card */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl transition-all ${
            isStep2Done ? "border-green-500/30 bg-green-500/5 shadow-inner" : "border-white/10 bg-white/5"
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-1 px-2.5 font-mono text-[10px] font-bold rounded-lg bg-slate-950/60 text-slate-450 border border-white/5">Step 2</span>
                {isStep2Done ? <CheckCircle className="h-5 w-5 text-green-400" /> : <div className="h-5 w-5 rounded-full border border-white/20"></div>}
              </div>
              <h3 className="text-sm font-bold text-white font-display">Browse live postings</h3>
              <p className="text-slate-300 text-[11px] mt-2.5 leading-relaxed">
                Search job indexes with targeted Location, Salary benchmarks, and Seniority filters. Grounding pulls verified active descriptions.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab("jobs")}
              className="mt-5 text-xs font-bold text-cyan-400 flex items-center gap-1.5 hover:gap-2.5 transition-all text-left w-fit cursor-pointer group"
            >
              {isStep2Done ? `Change Target (${selectedJobCompany})` : "Browse index"} <ArrowRight className="h-3.5 w-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </button>
          </div>

          {/* Step 3 Card */}
          <div className="border border-white/10 bg-white/5 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-1 px-2.5 font-mono text-[10px] font-bold rounded-lg bg-slate-950/60 text-slate-450 border border-white/5">Step 3</span>
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">Assess & Rewrite</h3>
              <p className="text-slate-300 text-[11px] mt-2.5 leading-relaxed">
                Assign suitability rating scores, identify critical keyword gaps, and map out tailored bullet lists and tailored cover letters.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab("tailor")}
              disabled={!isStep1Done || !isStep2Done}
              className="mt-5 text-xs font-bold text-cyan-400 disabled:text-slate-650 disabled:pointer-events-none flex items-center gap-1.5 hover:gap-2.5 transition-all text-left w-fit cursor-pointer group"
            >
              Develop tailored material <ArrowRight className="h-3.5 w-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Tech spotlight note styled beautifully with glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950/20 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <h4 className="text-xs font-semibold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" /> What is Google Search Grounding?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Traditional AI models have knowledge cut-offs. Under this application's engine, Gemini is equipped with live Google Search access. When you search for jobs, the LLM crawls index boards live, meaning you never view stale positions or fabricated dead URLs.
          </p>
        </div>

        <div className="bg-slate-950/20 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
          <h4 className="text-xs font-semibold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" /> Evaluation of Scrapers
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Older architectures (like basic python selenium scraper repositories) face extreme hurdles like IP bans, stale selector failures, and high system memory constraints. Moving core discovery to Grounded APIs provides absolute resilience.
          </p>
        </div>
      </div>
    </div>
  );
}
