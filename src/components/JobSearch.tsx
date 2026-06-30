import React, { useState, useEffect } from "react";
import { Search, MapPin, DollarSign, Sliders, Briefcase, RefreshCw, Layers, Compass, Check, ExternalLink, Calendar } from "lucide-react";
import { JobListing } from "../types";

interface JobSearchProps {
  onSelectJob: (job: JobListing) => void;
  selectedJobId?: string;
}

export default function JobSearch({ onSelectJob, selectedJobId }: JobSearchProps) {
  const [query, setQuery] = useState("React Engineer");
  const [location, setLocation] = useState("Remote");
  const [salary, setSalary] = useState("$120,000+");
  const [seniority, setSeniority] = useState<string>("Senior");

  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiGrounded, setApiGrounded] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Default first load search
  useEffect(() => {
    executeSearch();
  }, []);

  const executeSearch = async () => {
    setLoading(true);
    setError(null);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location, salary, seniority }),
      });

      const data = await response.json();
      if (response.ok) {
        setJobs(data.jobs || []);
        setApiGrounded(!data.mocked);
        setWarningMessage(data.warning || null);
      } else {
        setError(data.error || "Failed to search job roles.");
      }
    } catch (err) {
      setError("Failed to reach search server. Making mock-fallback visible.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSearch = (q: string) => {
    setQuery(q);
    // Since state update is async, manually invoke with fresh query value
    setLoading(true);
    setWarningMessage(null);
    fetch("/api/search-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, location, salary, seniority }),
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setApiGrounded(!data.mocked);
        setWarningMessage(data.warning || null);
      })
      .catch((_) => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200" id="job-search-module">
      {/* Search Header and Panel */}
      <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative">
        <h2 className="text-xl font-display font-semibold text-white">Grounded Job Crawler</h2>
        <p className="text-sm text-slate-300 mt-1">
          Crawls active listings using <strong className="text-cyan-400">Google Search Grounding</strong> to provide real, active roles. Filter location, salary, and seniority below.
        </p>

        {/* Filters Matrix */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 mb-1.5">Keywords</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="React Engineer, Python Dev..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/30 border border-white/10 rounded-xl text-xs text-white placeholder-slate-505 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 mb-1.5">Location Filter</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Texas, London, Remote"
                className="w-full pl-10 pr-4 py-2 bg-slate-950/30 border border-white/10 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 mb-1.5">Compensation</label>
            <div className="relative font-mono">
              <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <select
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none appearance-none"
              >
                <option value="Any" className="bg-slate-900 text-white">Any Compensation</option>
                <option value="$80,000+" className="bg-slate-900 text-white">$80,000+</option>
                <option value="$120,000+" className="bg-slate-900 text-white">$120,000+</option>
                <option value="$150,000+" className="bg-slate-900 text-white">$150,000+</option>
                <option value="$180,000+" className="bg-slate-900 text-white">$180,000+</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-3 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest font-mono text-slate-400 mb-1.5">Seniority</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none appearance-none"
              >
                <option value="Not Specified" className="bg-slate-900 text-white">Any Seniority</option>
                <option value="Junior" className="bg-slate-900 text-white">Junior Partner</option>
                <option value="Mid" className="bg-slate-900 text-white">Mid-Level Associate</option>
                <option value="Senior" className="bg-slate-900 text-white">Senior Specialist</option>
                <option value="Lead" className="bg-slate-900 text-white">Lead General / Architect</option>
                <option value="Executive" className="bg-slate-900 text-white">Executive Director</option>
              </select>
            </div>
            <button
              onClick={executeSearch}
              disabled={loading}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer h-[38px] shadow-lg shadow-cyan-500/15 border-transparent shrink-0"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-950" /> : <Search className="h-3.5 w-3.5" />} Crawl
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-5 flex flex-wrap gap-2 items-center border-t border-white/5 pt-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Popular Crawler Searches:</span>
          {["React Developer", "Python Systems Developer", "DevOps Consultant", "Scrum Master"].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSearch(preset)}
              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] rounded-lg transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Grounding feedback alert if mock */}
      {!apiGrounded && !loading && (
        <div className="bg-amber-500/5 border border-amber-500/20 backdrop-blur-xl rounded-xl p-4 flex gap-3 text-slate-300 animate-fade-in">
          <Compass className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-semibold text-amber-400 block mb-0.5">Grounding Mode: Static Compilation Preview</span>
            {warningMessage || (
              <>
                Our crawler is currently operating with simulated sandbox list results because no GEMINI_API_KEY is detected in settings secrets. <strong>To query live internet job postings</strong>, please configure a real Gemini API Key in the Secrets panel.
              </>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-slate-300 font-medium font-mono">Querying search indexes via Grounded Gemini 3.5...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
          {jobs.length === 0 ? (
            <div className="lg:col-span-12 py-16 text-center bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl">
              <Compass className="h-12 w-12 text-slate-500 mx-auto stroke-1" />
              <p className="text-sm font-semibold text-white mt-3">No active listings found</p>
              <p className="text-xs text-slate-400 mt-1">Refine your keywords or decrease filter limitations and try again.</p>
            </div>
          ) : (
            <div className="lg:col-span-12 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                Crawled Listings ({jobs.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <div
                      key={job.id}
                      className={`backdrop-blur-xl border rounded-2xl p-5 hover:shadow-xl hover:bg-white/10 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/5"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div>
                        {/* Title and Badge */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="font-sans font-semibold text-white group-hover:text-cyan-400 text-sm truncate">
                              {job.title}
                            </h4>
                            <p className="text-xs font-medium text-slate-300 mt-0.5">{job.company}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-950/60 text-slate-300 border border-white/15 font-mono text-[10px] rounded font-medium shrink-0">
                            {job.seniority}
                          </span>
                        </div>

                        {/* Location and Salary */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3.5 text-xs text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-cyan-400">
                            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                            {job.salary}
                          </span>
                          {job.postedDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {job.postedDate}
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        <p className="mt-4 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        {job.url ? (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-cyan-400 text-xs flex items-center gap-1.5 font-semibold transition-colors"
                          >
                            Source Link <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            Source: {job.source || "Web Grounding"}
                          </span>
                        )}

                        <button
                          onClick={() => onSelectJob(job)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Selected
                            </>
                          ) : (
                            "Match & Tailor"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
