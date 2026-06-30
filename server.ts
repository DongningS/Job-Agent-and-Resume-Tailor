import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser configuration for large uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[Warning] GEMINI_API_KEY environment variable is not set. Gemini API functions will fail.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper model definition
const GENERATION_MODEL = "gemini-3.5-flash";

// --- API ENDPOINTS ---

/**
 * Endpoint for testing health status
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiConfigured: !!apiKey,
  });
});

/**
 * Base64 docx file parsing using mammoth
 */
app.post("/api/parse-resume", async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "No document base64 data provided." });
    }

    const buffer = Buffer.from(base64Data, "base64");
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ success: false, error: "The Word document seems empty or text could not be extracted." });
    }

    // Use Gemini to quickly parse key details from the resume
    let parsedProfile = {
      name: "Unknown Professional",
      email: "",
      phone: "",
      skills: [] as string[],
      experience: [] as string[],
    };

    if (apiKey) {
      try {
        const profileResponse = await ai.models.generateContent({
          model: GENERATION_MODEL,
          contents: `Analyze the following raw resume text and extract the applicant's search-optimized metadata in a JSON format.
          Here is the raw text:
          ---
          ${rawText}
          ---`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of top 10 core candidate skills/technologies/methodologies.",
                },
                experienceSummary: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of summaries of last 3 job positions or relevant experiences.",
                },
              },
              required: ["name", "skills"],
            },
          },
        });

        if (profileResponse.text) {
          const parsed = JSON.parse(profileResponse.text.trim());
          parsedProfile = {
            name: parsed.name || "Candidate Name",
            email: parsed.email || "",
            phone: parsed.phone || "",
            skills: parsed.skills || [],
            experience: parsed.experienceSummary || [],
          };
        }
      } catch (geminiError) {
        console.error("Gemini failed parsing candidate profile, continuing with raw text:", geminiError);
      }
    }

    res.json({
      success: true,
      text: rawText,
      fileName,
      parsedProfile,
    });
  } catch (error: any) {
    console.error("Error parsing Word document:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process the document." });
  }
});

/**
 * Grounded live job search endpoint utilizing Google Search tool inside Gemini
 */
app.post("/api/search-jobs", async (req, res) => {
  try {
    const { query, location, salary, seniority } = req.body;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        mocked: true,
        warning: "Google Gemini API key is missing. Please configure it in Settings > Secrets.",
        jobs: getMockJobs(query, location),
      });
    }

    try {
      const searchQuery = `Find active job postings looking for: "${query || 'software engineer'}" ${location ? `located in "${location}"` : 'remote/onsite'} with ${seniority || 'any'} seniority level. ${salary ? `Salary expectation is around ${salary}` : ''}`;
      
      // Step 1: Perform the grounded search query
      const searchResponse = await ai.models.generateContent({
        model: GENERATION_MODEL,
        contents: `Perform active web queries to discover current, realistic job postings matching the criteria below.
        Criteria:
        - Job Role Keywords: ${query}
        - Target Location: ${location || "Any/Remote"}
        - Seniority required: ${seniority || "All"}
        - Salary/Payment notes: ${salary || "Not Specified"}
        
        Look up genuine sources (e.g., job boards, company careers pages). Retrieve at least 5 highly relevant matching positions.
        For each listing, capture the correct job Title, Company name, Location, specific Salary/Salary range description if found, Seniority indication, and a detailed description of the role responsibilities & requirements. Highlight actual URL references if found.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundedText = searchResponse.text;
      if (!groundedText) {
        throw new Error("No grounded search content was returned from Gemini.");
      }

      // Step 2: Convert the text report into a strictly structured JSON array
      const structuredResponse = await ai.models.generateContent({
        model: GENERATION_MODEL,
        contents: `You are an expert compiler. Take the grounded job information text below and transform it into a strictly structured JSON array of active Job List items. Ensure accurate parsing of criteria.
        
        Grounded Info:
        ---
        ${groundedText}
        ---
        
        Do not invent items that do not exist, but ensure every field is parsed cleanly. Value of 'seniority' must map strictly to one of: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive' | 'Not Specified'. Set a placeholder ID (e.g. "job-1", "job-2") for each.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                salary: { type: Type.STRING, description: "Extract salary/payment info. Use 'Not Specified' if not found." },
                seniority: { 
                  type: Type.STRING, 
                  description: "Map strictly to: 'Junior', 'Mid', 'Senior', 'Lead', 'Executive', or 'Not Specified'." 
                },
                description: { type: Type.STRING, description: "Highly comprehensive description of company, duties, technical required stack, and benefits." },
                url: { type: Type.STRING, description: "URL source of the posting if available, otherwise return an empty string." },
                source: { type: Type.STRING, description: "Where the job was compiled from (e.g., Indeed, LinkedIn, Company site)." },
                postedDate: { type: Type.STRING, description: "Relative date or exact timestamp when posted." }
              },
              required: ["id", "title", "company", "location", "salary", "seniority", "description"],
            },
          },
        },
      });

      const jsonText = structuredResponse.text;
      const parsedJobs = JSON.parse(jsonText.trim());

      res.json({
        success: true,
        jobs: parsedJobs,
      });
    } catch (geminiError: any) {
      console.error("Grounded job search failed due to Gemini error, falling back to mock results:", geminiError);
      let warningDetail = "Gemini Query Warning: Displaying high-fidelity simulated job listings.";
      if (geminiError.status === "RESOURCE_EXHAUSTED" || (geminiError.message && geminiError.message.includes("quota"))) {
        warningDetail = "Gemini API Quota Exceeded (429 limit). Displaying high-fidelity simulated job listings in sandbox mode.";
      } else if (geminiError.message) {
        warningDetail = `Gemini Query Failed: ${geminiError.message}. Displaying high-fidelity simulated job listings.`;
      }
      res.json({
        success: true,
        mocked: true,
        warning: warningDetail,
        jobs: getMockJobs(query, location),
      });
    }
  } catch (error: any) {
    console.error("Critical job search failure:", error);
    res.json({
      success: true,
      mocked: true,
      warning: error.message || "Failed to search and parse job postings.",
      jobs: getMockJobs(req.body.query, req.body.location),
    });
  }
});

/**
 * Detailed Matching, Rating and Tailoring document generator
 */
app.post("/api/analyze-and-tailor", async (req, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, companyName } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, error: "Both a parsed resume and a target job description are required." });
    }

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        mocked: true,
        warning: "Google Gemini API key is missing. Configured key in Settings is required to run tailored calculations.",
        matchResult: getMockMatchResult(resumeText, jobDescription, jobTitle, companyName),
      });
    }

    try {
      const analysisPrompt = `You are an elite automated career coach and technical resume surgeon. You compile matching indicators and write optimized job documents.
      Evaluate how suitable the candidate's Resume matches the target Job description.
      
      Candidate Resume Text:
      ---
      ${resumeText}
      ---
      
      Target Job Description [Title: "${jobTitle || 'Specified'}" at "${companyName || 'Target Company'}"]:
      ---
      ${jobDescription}
      ---
      
      You must output a highly tailored matching analysis and draft a customized Resume and Cover Letter optimized for this specific position.
      
      Instructions:
      1. Assess details and assign an 'overallScore' (0-100) reflecting direct technology match, background seniority alignment, and methodology cross-over.
      2. Map out arrays for 'matchedSkills', 'missingSkills' (important gaps), and 'growthSkills' (skills that would highlight quick ramp up).
      3. Calculate score breakdowns (each 0 to 100) for 'skillsMatch', 'experienceMatch', 'seniorityMatch', and 'cultureMatch'.
      4. Outline a list of actionable 'recommendations' to guide resume preparation.
      5. Formulate a fully 'tailoredResume' with:
         - An optimized highly engaging candidate summary.
         - Rewritten job experience blocks. Ensure that bullet points are rewritten to emphasize accomplishments matching the keywords from the job description. Do NOT fabricate credentials, but rephrase experiences to emphasize matching technologies, metrics, and relevant outcomes.
         - Structured array of custom skills.
         - Preserved education blocks.
      6. Draft a compelling, direct professional 'tailoredCoverLetter' using a persuasive, genuine, modern business-editorial tone (no excessive AI tropes, e.g., avoid "Dear Hiring Team, I am thrilled and ecstatic to paint a portrait of..."). Keep it professional, direct, and highlighting why their past work prepares them to crush the targets of this new role. Include placeholders like [Your Name], [Contact Info] clearly.`;

      const matchResponse = await ai.models.generateContent({
        model: GENERATION_MODEL,
        contents: analysisPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              growthSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              roleMismatchReason: { type: Type.STRING, description: "Mention seniority or title dissonance if any, else empty string." },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  skillsMatch: { type: Type.INTEGER },
                  experienceMatch: { type: Type.INTEGER },
                  seniorityMatch: { type: Type.INTEGER },
                  cultureMatch: { type: Type.INTEGER },
                },
                required: ["skillsMatch", "experienceMatch", "seniorityMatch", "cultureMatch"],
              },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              tailoredResume: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING, description: "A beautifully synthesized, search-grounded summary tailored to are the perfect hire." },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tailored structured keyword list." },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        role: { type: Type.STRING },
                        company: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        bulletPoints: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "3 to 4 rewritten accomplishment bullets injecting core matching keywords.",
                        },
                      },
                      required: ["role", "company", "bulletPoints"],
                    },
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        degree: { type: Type.STRING },
                        school: { type: Type.STRING },
                        year: { type: Type.STRING },
                      },
                      required: ["degree", "school"],
                    },
                  },
                },
                required: ["summary", "skills", "experience", "education"],
              },
              tailoredCoverLetter: { type: Type.STRING, description: "Complete, ready-to-copy cover letter formatted with nice paragraph layouts." },
            },
            required: [
              "overallScore",
              "matchedSkills",
              "missingSkills",
              "scoreBreakdown",
              "recommendations",
              "tailoredResume",
              "tailoredCoverLetter",
            ],
          },
        },
      });

      const jsonResult = matchResponse.text;
      res.json({
        success: true,
        matchResult: JSON.parse(jsonResult.trim()),
      });
    } catch (geminiError: any) {
      console.error("Tailoring evaluation failed due to Gemini error, falling back to mock results:", geminiError);
      let warningDetail = "Showing simulated tailoring metrics because Google Gemini rate limits or quota limits are active.";
      if (geminiError.status === "RESOURCE_EXHAUSTED" || (geminiError.message && geminiError.message.includes("quota"))) {
        warningDetail = "Gemini API Quota Exceeded (429 limit). Showing simulated tailoring metrics in sandbox mode.";
      } else if (geminiError.message) {
        warningDetail = `Gemini Query Failed: ${geminiError.message}. Showing simulated tailoring metrics.`;
      }
      res.json({
        success: true,
        mocked: true,
        warning: warningDetail,
        matchResult: getMockMatchResult(resumeText, jobDescription, jobTitle, companyName),
      });
    }
  } catch (error: any) {
    console.error("Tailoring assessment failure:", error);
    res.json({
      success: true,
      mocked: true,
      warning: error.message || "Failed to analyze and generate tailored assets.",
      matchResult: getMockMatchResult(req.body.resumeText, req.body.jobDescription, req.body.jobTitle, req.body.companyName),
    });
  }
});

// Mock utilities in case API keys are not supplied yet
function getMockJobs(query: string = "Software Engineer", location: string = ""): any[] {
  const loc = location || "San Francisco, CA (Hybrid)";
  return [
    {
      id: "mock-1",
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} Developer`,
      company: "Apex Global Technologies",
      location: loc,
      salary: "$120,000 - $155,000 + Equity",
      seniority: "Senior",
      description: "Apex is looking for an extraordinary professional to scale our microservices pipeline. You will collaborate on core features, define clean architectural patterns, rewrite legacy code blocks, and lead a squad of engineers. Tech stack includes TypeScript, React, Node.js, and cloud container deployments. Requires at least 4 years of proven hands-on technical execution.",
      source: "Indeed Grounding",
      postedDate: "2 days ago",
    },
    {
      id: "mock-2",
      title: `Lead Systems Architect (${query})`,
      company: "Stellar Cloud Systems LLC",
      location: "Austin, TX (Remote)",
      salary: "$160k - $190k + Performance Bonus",
      seniority: "Lead",
      description: "Drive the cloud-native transition of our next-gen enterprise dashboard tracking logic. Direct experience in handling High-Availability workflows, distributed telemetry, and PostgreSQL/NoSQL query tuning. Seeking detailed execution, passion for robust interface delivery, and strong communication patterns across cross-functional units.",
      source: "LinkedIn Grounding",
      postedDate: "Just added",
    },
    {
      id: "mock-3",
      title: `Associate Technical Consultant`,
      company: "Bridge Consulting Group",
      location: "New York, NY (Onsite)",
      salary: "$85,000 - $110,000",
      seniority: "Mid",
      description: "Analyze, configure and customize technical systems for diverse multi-industry client partners. Build custom APIs, handle structured integrations, write detailed user documentation, and deliver regular walkthrough sessions. Strong familiarity with modern JavaScript/TypeScript architectures and databases is favored.",
      source: "Company Careers Portal",
      postedDate: "1 week ago",
    },
  ];
}

function getMockMatchResult(resumeText: string, jobDescription: string, jobTitle = "Software Developer", companyName = "Innovate Systems"): any {
  // Extract simple features
  const words = resumeText.toLowerCase();
  const hasTypeScript = words.includes("typescript") || words.includes("js") || words.includes("node");
  const hasReact = words.includes("react");
  const score = hasTypeScript && hasReact ? 82 : 65;

  return {
    overallScore: score,
    matchedSkills: ["TypeScript", "JavaScript", "React", "State Management", "Git & Collaboration"],
    missingSkills: ["Docker Containerization", "Automated Playwright Testing", "Distributed Caching"],
    growthSkills: ["Tailwind Styling Prefixes", "Strict Async Flow Controls"],
    roleMismatchReason: "",
    scoreBreakdown: {
      skillsMatch: Math.min(100, score + 5),
      experienceMatch: score - 4,
      seniorityMatch: 85,
      cultureMatch: 90,
    },
    recommendations: [
      "Prioritize your frontend container management skills in your work description.",
      "Integrate mentions of automated integration tests and Playwright scripts in your last role.",
      "Emphasize metrics-driven outcomes in microservice performance.",
    ],
    tailoredResume: {
      summary: `Performance-focused and meticulous individual equipped with a strong software development background. Highly skilled in writing scalable TypeScript, deploying responsive React SPAs, and structuring standard Express database queries. Experienced at transforming client requirements into clean functional assets, with a focus on delivering high-octane products at ${companyName}.`,
      skills: ["TypeScript (ESNext)", "React 19 & State Hooks", "Tailwind CSS", "Node / Express API Architecture", "Git Version Control", "Drizzle & Cloud Hosting"],
      experience: [
        {
          role: "Senior Software Engineer",
          company: "Innovate Labs",
          duration: "2024 - Present",
          bulletPoints: [
            "Engineered elegant full-stack dashboards using TypeScript and React 18, increasing user engagement metrics by 24%.",
            "Refactored relational express gateways, improving query throughput and removing redundant database roundtrips.",
            "Mentored 4 junior technicians on responsive visual principles, and implemented strict state hooks testing metrics.",
          ],
        },
        {
          role: "Software Developer",
          company: "SysOps Innovations",
          duration: "2021 - 2024",
          bulletPoints: [
            "Formulated modular UI utilities using Tailwind CSS responsive prefixes and streamlined asset bundles.",
            "Programmed client integrations for third-party platforms, boosting overall processing speed by 15%.",
            "Participated actively in daily scrum, delivering continuous integration builds for main services.",
          ],
        },
      ],
      education: [
        {
          degree: "B.S. in Computer Science",
          school: "Metropolitan State University",
          year: "2021",
        },
      ],
    },
    tailoredCoverLetter: `Dear Hiring Manager at ${companyName || 'the Selection Committee'},

I am writing to express my strong enthusiasm for the ${jobTitle || 'Designated Role'} opening. Having reviewed the description, I see a powerful alignment between your technology directions and my hands-on experience deploying clean, resilient typescript systems.

In my previous tenure, I specialized in structuring reactive client interfaces using React and optimizing transactional databases. When aligning with your team's objective, I bring a reliable work ethic focused on clean architecture and highly maintainable systems.

I am particularly excited about the prospect of joining ${companyName || 'your organization'} at this stage. I would welcome the opportunity to dive deeper into how my technical backgrounds can translate to immediate productivity for your engineers.

Thank you for your valuable time and consideration.

Sincerely,
[Your Name]
[Email & Phone Portfolio Placeholder]`,
  };
}


// --- SPA / VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Dev Mode] Loaded Vite middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Production Mode] Serving static assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booting on port ${PORT}...`);
    console.log(`Check app live at http://localhost:${PORT}`);
  });
}

startServer();
