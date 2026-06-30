import React from "react";
import { Terminal, Cpu, CheckCircle2, AlertTriangle, HelpCircle, Layers, Sparkles, Database } from "lucide-react";
import { ApiComparisonMetrics } from "../types";

export default function ComparisonPanel() {
  const comparisonData: ApiComparisonMetrics[] = [
    {
      provider: "Google Gemini (gemini-3.5-flash / 3.1-pro)",
      modelName: "gemini-3.5-flash / gemini-3.1-pro-preview",
      contextWindow: "1,048,576 to 2,097,152 Tokens",
      costPerMillion: "$0.075 / $1.25 (Input), $0.30 / $5.00 (Output)",
      speed: "Ultra-fast (sub-second responses)",
      searchGrounding: "Native Web Search Grounding built-in (Out of the box, no extra crawl tools needed)",
      formattingAccuracy: "99.2% (Native Schema Enforcement through Type restrictions)",
      specialty: "High-volume documents, multimodal parsing, live web search retrieval, and real-time document rewriting.",
      advantages: [
        "Massive context lets you upload entire books or 100+ resume revisions at once.",
        "Zero-config Google Search Grounding ensures active, real-world job availability.",
        "Most cost-effective model on the market (10x-50x cheaper than competitors).",
        "Strict JSON Schema schema definitions prevent API response distortion."
      ],
      disadvantages: [
        "Needs explicit instructions to suppress conversational fluff."
      ]
    },
    {
      provider: "OpenAI GPT (gpt-4o / gpt-4o-mini)",
      modelName: "gpt-4o / gpt-4o-mini",
      contextWindow: "128,000 Tokens",
      costPerMillion: "$2.50 / $0.15 (Input), $10.00 / $0.60 (Output)",
      speed: "Moderate-Fast",
      searchGrounding: "Requires custom Bing Search integration or external agent frameworks (LangChain)",
      formattingAccuracy: "98.5% (Structured Outputs with JSON Mode)",
      specialty: "General conversational logic, standard coding syntaxes, and standard text generation presets.",
      advantages: [
        "Excellent formatting for general narrative writing.",
        "Extremely wide developer community and existing wrappers."
      ],
      disadvantages: [
        "Very small context window limits comparison of many files.",
        "No free direct search grounding; scraping must be written manually.",
        "Significantly higher token costs for high-volume analysis."
      ]
    },
    {
      provider: "Claude Code / Claude 3.5 Sonnet",
      modelName: "claude-3-5-sonnet-v2",
      contextWindow: "200,000 Tokens",
      costPerMillion: "$3.00 (Input), $15.00 (Output)",
      speed: "Moderate",
      searchGrounding: "No built-in search grounding. Must use bespoke client-side web scraper APIs like Firecrawl.",
      formattingAccuracy: "97.8% (XML gating or raw system prompts)",
      specialty: "Complex logic reasoning, deep code architecture modification, and CLI developer agents.",
      advantages: [
        "Extremely precise writing style with less typical 'AI bloat'.",
        "Best-in-class multi-step coding execution capabilities."
      ],
      disadvantages: [
        "No native live search; requires tedious web scraper workarounds.",
        "Highest cost per token of the three leading frameworks.",
        "No built-in full-stack document generation platform without complex integrations."
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-200" id="comparison-module">
      {/* Overview Card */}
      <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Technical Audit: DongningS/job_agent</h2>
            <p className="text-sm text-slate-350">Evaluating robustness and parsing effectiveness against human-designed resumes</p>
          </div>
        </div>

        <p className="text-slate-305 text-sm leading-relaxed mb-6">
          The typical design of custom Python-based command-line agents (like <code className="bg-slate-900 text-cyan-400 border border-white/5 px-1.5 py-0.5 rounded font-mono text-xs">DongningS/job_agent</code>) usually relies on static library scrapers, Selenium, or langchain frameworks. While functional for academic tasks, they face severe operational limitations in production environments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-red-500/25 bg-red-500/5 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Fragility & Production Failures
            </h3>
            <ul className="text-xs space-y-3.5 text-slate-300">
              <li className="flex gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Anti-Scraping & CAPTCHA Blocks:</strong> Sites like LinkedIn, Indeed, and ZipRecruiter spend millions blocking headless browser requests. Script agents quickly trigger Cloudflare walls, failing without manual cookie re-authentication.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Stale DOM Selectors:</strong> Hand-crafted HTML scrapers require constant maintenance. If a selector class name shifts by a single character during a platform update, the entire parser crashes.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Lack of Direct Document Parsing:</strong> Command-line scripts rarely offer high-fidelity interactive feedback, making it hard for everyday job seekers to examine matched keyword overlays side-by-side.</span>
              </li>
            </ul>
          </div>

          <div className="border border-emerald-500/20 bg-emerald-500/5 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Core Optimization Solution
            </h3>
            <ul className="text-xs space-y-3.5 text-slate-300">
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Native Google Search Grounding:</strong> By substituting static selenium scripts with Google's search integrations, we fetch active job listings with live status reports verified by the Google search index.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Model-Driven Text Extraction:</strong> We handle binary <code className="bg-slate-900 px-1 rounded font-mono text-xs text-cyan-400 border border-white/5">.docx</code> buffers directly in-memory, bypassing vulnerable local OS dependencies or pandoc converters.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Interactive Side-by-Side Editor:</strong> Instead of dumping plain text output files to a local shell directory, our responsive dashboard lets you modify tailored resume sections or edit generated letters in real time.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-slate-950/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Enterprise AI Engine Comparison Matrix</h2>
            <p className="text-sm text-slate-350">Detailed breakdown of OpenAI GPT, Anthropic Claude Code, and Google Gemini APIs</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-950/30">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/40 border-b border-white/10">
                <th className="p-4 font-sans font-semibold text-slate-300 text-xs uppercase tracking-wider">Metrics</th>
                {comparisonData.map((d, idx) => (
                  <th key={idx} className="p-4 font-sans font-bold text-white border-l border-white/10">
                    {d.provider}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Core Model Used</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 font-mono text-cyan-400 border-l border-white/5 bg-slate-950/20">
                    {d.modelName}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Context Window</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 font-medium border-l border-white/5">
                    {d.contextWindow}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Token Costs (Mln)</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 text-slate-300 border-l border-white/5">
                    {d.costPerMillion}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Processing Speed</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 text-slate-300 border-l border-white/5">
                    {d.speed}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Native Live Search</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 font-semibold text-amber-300 bg-amber-500/5 border-l border-white/5">
                    {d.searchGrounding}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">JSON Formatting Schema</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 text-slate-350 border-l border-white/5">
                    {d.formattingAccuracy}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Advantages</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 text-slate-350 border-l border-white/5 align-top">
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                      {d.advantages.map((adv, aIdx) => <li key={aIdx}>{adv}</li>)}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-slate-950/50 border-r border-white/5">Disadvantages</td>
                {comparisonData.map((d, idx) => (
                  <td key={idx} className="p-4 text-slate-350 border-l border-white/5 align-top">
                    <ul className="list-disc pl-4 space-y-1.5 text-red-400/80">
                      {d.disadvantages.map((ds, dIdx) => <li key={dIdx}>{ds}</li>)}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide/Tip Box */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-2xl rounded-xl p-5 flex gap-4 items-start">
        <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-cyan-400">Why Google Gemini is the best fit for Job Agent Pro</h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            Standard scraping algorithms quickly lead to IP blocked nodes. Moving the job discovery layer away from static scrappers directly into high-fidelity AI modules leverages <strong className="text-cyan-400 font-bold">Google Search Grounding</strong>. Plus, with Gemini's highly cost-effective pricing structure and massive context window limits, analyzing multiple resume variations back-to-back causes virtually zero billable penalty.
          </p>
        </div>
      </div>
    </div>
  );
}
