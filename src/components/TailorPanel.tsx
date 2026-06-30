import React, { useState, useEffect } from "react";
import { Sparkles, Award, CheckCircle, AlertTriangle, Play, RefreshCw, FileText, Copy, Download, Edit3, ArrowRight, Check, CheckSquare, Layers } from "lucide-react";
import { JobListing, MatchResult } from "../types";

interface TailorPanelProps {
  resumeText: string;
  selectedJob: JobListing | null;
}

export default function TailorPanel({ resumeText, selectedJob }: TailorPanelProps) {
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Tabs for document outcomes
  const [documentTab, setDocumentTab] = useState<"resume" | "cover">("resume");
  
  // Local edit states
  const [editMode, setEditMode] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  
  // Success states for feedback
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    // Reset report on job selection change
    setMatchResult(null);
    setEditMode(false);
    setError(null);
    setWarningMessage(null);
  }, [selectedJob]);

  const handleRunAnalysis = async () => {
    if (!resumeText) {
      setError("Please navigate to the Resume tab and upload or paste your resume first.");
      return;
    }
    if (!selectedJob) {
      setError("Please select a target job posting from the Job Search dashboard first.");
      return;
    }

    setLoading(true);
    setError(null);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/analyze-and-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: selectedJob.description,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMatchResult(data.matchResult);
        setApiSuccess(!data.mocked);
        setWarningMessage(data.warning || null);
        
        // Load initial edit variables
        setEditedSummary(data.matchResult.tailoredResume?.summary || "");
        setEditedCoverLetter(data.matchResult.tailoredCoverLetter || "");
      } else {
        setError(data.error || "Failed to calculate fitness and tailors.");
      }
    } catch (err) {
      setError("Failed to process request on the server. Make sure the server-side controller is running.");
    } finally {
      setLoading(false);
    }
  };

  const triggerCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  // Compile full tailored resume text representation for copy/download
  const compileFullResumeText = (): string => {
    if (!matchResult) return "";
    const resume = matchResult.tailoredResume;
    let text = `TAILORED RESUME SUMMARY\n======================\n${editedSummary || resume.summary}\n\n`;
    
    text += `CORE OPTIMIZED SKILLS\n====================\n${resume.skills.join(", ")}\n\n`;
    
    text += `REWRITTEN PROFESSIONAL EXPERIENCE\n=================================\n`;
    resume.experience.forEach((job) => {
      text += `${job.role} - ${job.company} (${job.duration || "Present"})\n`;
      job.bulletPoints.forEach((bullet) => {
        text += `• ${bullet}\n`;
      });
      text += `\n`;
    });

    text += `EDUCATION\n=========\n`;
    resume.education.forEach((edu) => {
      text += `${edu.degree} - ${edu.school} (${edu.year || "N/A"})\n`;
    });

    return text;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200" id="match-tailor-module">
      {/* Active Selection Display */}
      <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Match & Document Optimizer</h2>
            <p className="text-sm text-slate-300 mt-1">
              Select or confirm your resume, select a target job listing, and let Gemini rewrite summaries, highlight keywords, and draft cover letters.
            </p>
          </div>
          
          <button
            onClick={handleRunAnalysis}
            disabled={loading || !selectedJob || !resumeText}
            className="px-5 py-2.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-45 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 border-transparent shadow-lg shadow-cyan-500/15"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin text-slate-950" /> : <Sparkles className="h-4 w-4 text-slate-950" />} Optimize Suitability
          </button>
        </div>

        {/* Selected parameters indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold mb-2">Uploaded Resume</span>
            {resumeText ? (
              <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Loaded Resume ({resumeText.split(/\s+/).length} Words)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>No resume provided. Navigate to Resume Manager screen first.</span>
              </div>
            )}
          </div>

          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold mb-2">Target Job Description</span>
            {selectedJob ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs min-w-0">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  <span className="truncate">{selectedJob.title} — {selectedJob.company}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>No target job selected. Browse and select standard listings in Grounded Job Crawler first.</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 border border-red-500/20 bg-red-500/10 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {!apiSuccess && matchResult && (
          <div className="mt-4 p-3.5 border border-amber-500/20 bg-amber-500/5 text-amber-350 text-xs rounded-xl leading-relaxed">
            <strong>Notice:</strong> {warningMessage || "Showing simulated tailoring metrics because there is no Gemini API configured in Settings. Please add a valid key to run real analysis and bespoke cover letters."}
          </div>
        )}
      </div>

      {loading && (
        <div className="py-24 text-center space-y-4 bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl">
          <RefreshCw className="h-10 w-10 animate-spin text-cyan-400 mx-auto" />
          <h4 className="text-sm font-semibold text-white">Calibrating keyword matches against base profile...</h4>
          <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed">
            This compiles exact skill ratios, rewrites experience points to emphasize matching capabilities, and styles cover letters using modern business copywriting.
          </p>
        </div>
      )}

      {/* Main Results Display */}
      {matchResult && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Scoring and metrics */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Score Wheel */}
            <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl text-center relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400">Match Compatibility Rating</span>
              
              <div className="relative flex items-center justify-center my-6">
                <div className="w-36 h-36 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
                  <div className="text-4xl font-display font-bold text-white relative z-10">
                    {matchResult.overallScore}%
                  </div>
                  {/* Styled outer gauge rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 opacity-70 animate-pulse"></div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-sans font-bold text-white text-base">
                  {matchResult.overallScore >= 80 ? "Highly Compatible" : matchResult.overallScore >= 60 ? "Moderate Potential" : "Low Specific Fit"}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Calculated based on technology stack intersection, seniority thresholds alignment, and bullet metrics.
                </p>
              </div>

              {/* Skill breakdowns */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5 text-left text-xs bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">Skillset Fit</span>
                  <div className="font-bold text-cyan-400 text-sm mt-0.5">{matchResult.scoreBreakdown?.skillsMatch}%</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">Seniority Fit</span>
                  <div className="font-bold text-cyan-400 text-sm mt-0.5">{matchResult.scoreBreakdown?.seniorityMatch}%</div>
                </div>
                <div className="mt-2.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">Experience Fit</span>
                  <div className="font-bold text-cyan-400 text-sm mt-0.5">{matchResult.scoreBreakdown?.experienceMatch}%</div>
                </div>
                <div className="mt-2.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">Culture Match</span>
                  <div className="font-bold text-cyan-400 text-sm mt-0.5">{matchResult.scoreBreakdown?.cultureMatch}%</div>
                </div>
              </div>
            </div>

            {/* Keyword intersections checklist */}
            <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" /> Target Keyword Match Checklist
              </h3>

              {/* Matched */}
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-green-400 font-bold block mb-2">Matched Key Capabilities ({matchResult.matchedSkills?.length || 0})</span>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.matchedSkills?.map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-green-500/10 text-green-300 border border-green-500/25 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <Check className="h-3 w-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Gaps (Missing) */}
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-red-400 font-bold block mb-2">Critical Keyword Gaps ({matchResult.missingSkills?.length || 0})</span>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missingSkills?.map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-red-500/10 text-red-350 border border-red-500/25 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-red-400" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended growth */}
              {matchResult.growthSkills && matchResult.growthSkills.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block mb-2">Upskill & Highlight areas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.growthSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[10px] font-bold rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations plan */}
              {matchResult.recommendations && (
                <div className="pt-4 border-t border-white/5 space-y-2.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block font-bold">Actionable Recommendations</span>
                  <ul className="text-xs space-y-2 text-slate-300">
                    {matchResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex gap-2 items-start leading-relaxed">
                        <CheckSquare className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Document generated workspace */}
          <div className="lg:col-span-7 bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header and Switcher tabs */}
            <div className="border-b border-white/5 bg-slate-950/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-1 bg-white/5 p-1 border border-white/5 rounded-xl w-fit">
                <button
                  onClick={() => setDocumentTab("resume")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                    documentTab === "resume"
                      ? "bg-white/10 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tailored Resume
                </button>
                <button
                  onClick={() => setDocumentTab("cover")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                    documentTab === "cover"
                      ? "bg-white/10 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tailored Cover Letter
                </button>
              </div>

              {/* Global document actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-2 border rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                    editMode
                      ? "bg-cyan-500 text-slate-950 border-cyan-500 font-bold"
                      : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                  title="Make corrections live"
                >
                  <Edit3 className="h-3.5 w-3.5" /> {editMode ? "Viewing Layout" : "Edit Live"}
                </button>

                <button
                  onClick={() => {
                    const textToCopy = documentTab === "resume" ? compileFullResumeText() : editedCoverLetter || matchResult.tailoredCoverLetter;
                    triggerCopy(textToCopy);
                  }}
                  className="p-2 border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Copy formatted plain text"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>

                <button
                  onClick={() => {
                    const filename = documentTab === "resume" ? "tailored_resume.txt" : "tailored_cover_letter.txt";
                    const content = documentTab === "resume" ? compileFullResumeText() : editedCoverLetter || matchResult.tailoredCoverLetter;
                    triggerDownload(filename, content);
                  }}
                  className="p-2 border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Export file"
                >
                  {downloaded ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Download className="h-3.5 w-3.5" />} Save File
                </button>
              </div>
            </div>

            {/* Document Workspace Content */}
            <div className="p-6">
              {documentTab === "resume" ? (
                // RESUME TAB
                <div className="space-y-6">
                  {/* Summary Block */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Tailored Profile Summary</h4>
                    {editMode ? (
                      <textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        className="w-full text-xs p-3.5 border border-cyan-500/30 bg-black/30 rounded-xl font-mono text-slate-200 h-28 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-slate-200 text-xs leading-relaxed italic">
                        "{editedSummary || matchResult.tailoredResume.summary}"
                      </p>
                    )}
                  </div>

                  {/* Skills Block */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Optimized Keyword Strategy</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.tailoredResume.skills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-200 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experiences Block */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-3 block">Rewritten Structural Experience</h4>
                    <div className="space-y-5">
                      {matchResult.tailoredResume.experience.map((job, jIdx) => (
                        <div key={jIdx} className="border-l-2 border-white/10 pl-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-white text-xs">{job.role}</h5>
                              <p className="text-xs text-slate-305">{job.company}</p>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">{job.duration || "N/A"}</span>
                          </div>
                          
                          <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-xs">
                            {job.bulletPoints.map((bullet, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education Block */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Education Background</h4>
                    <div className="space-y-2">
                      {matchResult.tailoredResume.education.map((edu, eIdx) => (
                        <div key={eIdx} className="text-xs text-slate-300 flex justify-between">
                          <span className="font-semibold text-slate-200">{edu.degree} — {edu.school}</span>
                          <span className="font-mono text-slate-400">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // COVER LETTER TAB
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-3 block">Copywriter Letter Workspace</h4>
                  
                  {editMode ? (
                    <textarea
                      value={editedCoverLetter}
                      onChange={(e) => setEditedCoverLetter(e.target.value)}
                      className="w-full h-[450px] p-4 text-xs font-mono border border-cyan-500/30 bg-black/30 rounded-xl text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                    />
                  ) : (
                    <div className="p-5 border border-white/10 rounded-xl bg-slate-900/30 text-slate-100 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                      {editedCoverLetter || matchResult.tailoredCoverLetter}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification instructions */}
            <div className="bg-slate-950/45 border-t border-white/5 p-4 font-mono text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <span>Optimized in strict correlation with the target job posting with no unrequested credentials added.</span>
            </div>
          </div>
        </div>
      )}

      {/* Landing display if no match analysis has been done yet */}
      {!matchResult && !loading && (
        <div className="text-center py-20 bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl">
          <Award className="mx-auto h-16 w-16 text-slate-500 stroke-1" />
          <h3 className="text-base font-semibold text-white mt-4">Optimized Document Terminal</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
            Please make sure both your base resume is loaded and a live job listing represents your focus before starting suitability tailored algorithms.
          </p>

          <button
            onClick={handleRunAnalysis}
            disabled={!selectedJob || !resumeText}
            className="mt-6 px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 disabled:opacity-45 disabled:pointer-events-none transition-all cursor-pointer shadow-lg shadow-cyan-500/15"
          >
            Run Compatibility Calculator
          </button>
        </div>
      )}
    </div>
  );
}
