export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive' | 'Not Specified';
  description: string;
  url?: string;
  source?: string;
  postedDate?: string;
}

export interface ParseResumeResponse {
  success: boolean;
  text: string;
  fileName: string;
  parsedProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience: string[];
  };
  error?: string;
}

export interface TailoredResumeData {
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    bulletPoints: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
}

export interface MatchResult {
  overallScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  growthSkills: string[];
  roleMismatchReason?: string;
  scoreBreakdown: {
    skillsMatch: number;      // 0-100
    experienceMatch: number;  // 0-100
    seniorityMatch: number;   // 0-100
    cultureMatch: number;     // 0-100
  };
  recommendations: string[];
  tailoredResume: TailoredResumeData;
  tailoredCoverLetter: string;
}

export interface ApiComparisonMetrics {
  provider: string;
  modelName: string;
  contextWindow: string;
  costPerMillion: string;
  speed: string;
  searchGrounding: string;
  formattingAccuracy: string;
  specialty: string;
  advantages: string[];
  disadvantages: string[];
}
