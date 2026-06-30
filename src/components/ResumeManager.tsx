import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw, Layers, Badge, Info, Trash2 } from "lucide-react";
import { ParseResumeResponse } from "../types";

interface ResumeManagerProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  parsedProfile: any;
  setParsedProfile: (profile: any) => void;
}

export default function ResumeManager({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  parsedProfile,
  setParsedProfile,
}: ResumeManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from localStorage if exists
  useEffect(() => {
    const savedText = localStorage.getItem("job_agent_resume_text");
    const savedName = localStorage.getItem("job_agent_resume_name");
    const savedProfile = localStorage.getItem("job_agent_resume_profile");

    if (savedText) setResumeText(savedText);
    if (savedName) setFileName(savedName);
    if (savedProfile) {
      try {
        setParsedProfile(JSON.parse(savedProfile));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    // We restrict to .docx as requested or .txt fallback
    const isDocx = file.name.endsWith(".docx");
    const isTxt = file.name.endsWith(".txt");

    if (!isDocx && !isTxt) {
      setError("Please upload a standard Word document (.docx) or a plain text (.txt) file.");
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      if (isTxt) {
        const text = await file.text();
        setResumeText(text);
        
        // Simple profile model for text files
        const simpleProfile = {
          name: file.name.split(".")[0],
          skills: ["Extracted from plain text file"],
          experience: ["Text document uploaded successfully"],
        };
        setParsedProfile(simpleProfile);
        
        localStorage.setItem("job_agent_resume_text", text);
        localStorage.setItem("job_agent_resume_name", file.name);
        localStorage.setItem("job_agent_resume_profile", JSON.stringify(simpleProfile));
        setLoading(false);
        return;
      }

      // Read as base64 for server mammoth processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        if (!base64String) {
          setError("Failed to read Word document. Please try again.");
          setLoading(false);
          return;
        }

        // Get clean base64 data by splitting off the mime prefix
        const base64Data = base64String.split(",")[1];

        try {
          const response = await fetch("/api/parse-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Data, fileName: file.name }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setResumeText(data.text);
            if (data.parsedProfile) {
              setParsedProfile(data.parsedProfile);
              localStorage.setItem("job_agent_resume_profile", JSON.stringify(data.parsedProfile));
            }
            
            localStorage.setItem("job_agent_resume_text", data.text);
            localStorage.setItem("job_agent_resume_name", file.name);
          } else {
            setError(data.error || "Failed to extract text from DOCX file on the server.");
          }
        } catch (serverErr) {
          setError("Network or server connection disrupted. Ensure the server backend is running.");
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setLoading(false);
    }
  };

  const clearResume = () => {
    setResumeText("");
    setFileName("");
    setParsedProfile(null);
    localStorage.removeItem("job_agent_resume_text");
    localStorage.removeItem("job_agent_resume_name");
    localStorage.removeItem("job_agent_resume_profile");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200" id="resume-manager-module">
      {/* Intro Header */}
      <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative">
        <h2 className="text-xl font-display font-semibold text-white">Your Base Resume Profile</h2>
        <p className="text-sm text-slate-300 mt-1">
          Upload your resume.docx file or paste text below. We extract structural metadata to calculate compatibility and tailor custom document versions.
        </p>

        {/* Upload Container */}
        <div className="mt-6">
          {!fileName ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-cyan-500 bg-cyan-950/25 scale-[1.01]"
                  : "border-white/20 bg-white/5 hover:border-cyan-400 hover:bg-white/10"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".docx, .txt"
                onChange={handleFileChange}
              />
              <UploadCloud className="mx-auto h-12 w-12 text-slate-400 stroke-1 hover:text-cyan-400 transition-colors" />
              <p className="mt-3 text-sm font-medium text-slate-200">
                Drag and drop your <span className="text-cyan-400 font-semibold">resume.docx</span> here
              </p>
              <p className="text-xs text-slate-450 mt-1.5">Only Word (.docx) or Text (.txt) formats supported</p>
              <button
                type="button"
                className="mt-4 px-4 py-1.5 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
              >
                Choose Local File
              </button>
            </div>
          ) : (
            <div className="border border-white/10 bg-slate-900/40 rounded-xl p-5 flex items-start justify-between">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{fileName}</h3>
                  <div className="flex gap-2 items-center mt-1 text-xs text-green-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Parsed & Ready</span>
                  </div>
                </div>
              </div>
              <button
                onClick={clearResume}
                className="p-1 px-2.5 border border-white/15 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs cursor-pointer bg-white/5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 border border-red-500/20 bg-red-500/10 text-red-300 text-xs rounded-xl flex gap-2 items-center animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-4 border border-white/10 bg-slate-950/45 rounded-xl flex items-center justify-center gap-3">
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
            <span className="text-xs text-slate-300 font-medium font-mono">Running mammoth extraction + Gemini structural parsing...</span>
          </div>
        )}
      </div>

      {/* Structured Profile Summary & Plain Text Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Extracted Metadata Stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl relative">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" /> Extracted Elements
            </h3>

            {parsedProfile ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-450 uppercase tracking-widest font-mono text-[10px]">Candidate</span>
                  <div className="text-cyan-400 font-semibold text-sm mt-0.5">
                    {parsedProfile.name || "Unknown Candidate"}
                  </div>
                </div>

                {parsedProfile.email && (
                  <div>
                    <span className="text-slate-450 uppercase tracking-widest font-mono text-[10px]">Email</span>
                    <div className="text-slate-200 mt-0.5">{parsedProfile.email}</div>
                  </div>
                )}

                {parsedProfile.skills && parsedProfile.skills.length > 0 && (
                  <div>
                    <span className="text-slate-450 uppercase tracking-widest font-mono text-[10px] block mb-2">Top Skills Found</span>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedProfile.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-200 text-[11px] font-medium transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedProfile.experience && parsedProfile.experience.length > 0 && (
                  <div>
                    <span className="text-slate-450 uppercase tracking-widest font-mono text-[10px] block mb-2">Extracted Milestones</span>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {parsedProfile.experience.map((exp: string, index: number) => (
                        <div key={index} className="p-2.5 border border-white/5 rounded-xl bg-white/5 text-[11px] text-slate-300 leading-relaxed">
                          {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="mx-auto h-8 w-8 text-slate-500 stroke-1" />
                <p className="text-slate-405 text-xs mt-2 italic">Upload a resume to inspect extracted attributes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Plain Text raw editor */}
        <div className="lg:col-span-7 bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white">Raw Resume Work-board</h3>
            <span className="text-[10px] px-2 py-0.5 font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 rounded">
              {resumeText ? `${resumeText.split(/\s+/).length} Words` : "Empty"}
            </span>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              localStorage.setItem("job_agent_resume_text", e.target.value);
            }}
            placeholder="No resume loaded yet. Paste your plain-text CV here, or upload a .docx version above."
            className="w-full h-80 p-3.5 border border-white/10 bg-slate-950/30 rounded-xl text-xs text-slate-300 font-mono focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
