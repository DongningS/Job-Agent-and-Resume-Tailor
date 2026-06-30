# Job Agent Pro: Grounded Career Copilot

Job Agent Pro is a high-fidelity, full-stack React and Express application designed to revolutionize the job hunt. By replacing fragile, easily blocked static web scrapers with **Google Search Grounding via Gemini**, Job Agent Pro fetches real-time, active job postings and performs granular compatibility audits against your uploaded resume.

---

## 🚀 Key Features

* **Grounded Job Crawler**: Discover active, real-world postings using live Google Search index integration. Filter by location, seniority level, and compensation without the risk of CAPTCHAs or broken DOM scrapers.
* **Resume Manager**: Upload `.docx` files or paste plain text. The system parses structural metadata and extracts career highlights, milestones, and candidate details in-memory.
* **Match & Document Optimizer**: Instantly compute compatibility metrics (Overall Score, Skillset Fit, Seniority Alignment, Culture Match) and view custom keyword intersection checklists.
* **Bespoke Document Generation**: Draft highly tailored, industry-specific summaries, resumes, and persuasive cover letters using modern business-editorial copywriting. Includes live side-by-side editing, text-copying, and custom file downloads.
* **Technical Audit Matrix**: Examine the architectural advantages of model-driven grounding over legacy command-line python agents side-by-side.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion
* **Backend**: Express (NodeJS), TypeScript (`tsx` development runner, CJS production build via `esbuild`)
* **AI Engine**: `@google/genai` (utilizing Gemini models with Google Search grounding tool and structured JSON response schemas)

---

## ⚙️ How to Configure secrets in AI Studio

To run the application with live internet grounding and personalized document optimization:
1. Locate the **Settings > Secrets** panel in the Google AI Studio user interface.
2. Click **Add Secret** (or **New Secret**).
3. Set the Name of the credential to `GEMINI_API_KEY`.
4. Paste your genuine API Key from [Google AI Studio](https://aistudio.google.com/) as the value, and click **Save**.
5. *Security Assurance*: When you share or publish your app, your secure credentials are kept on the server and are **never** visible to other viewers or exposed to the browser.

---

## 💻 Running Locally

### Prerequisites
* NodeJS (v18+)
* npm

### Installation
1. Clone your repository (or extract the downloaded ZIP folder).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory based on `.env.example` and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

### Building for Production
To bundle and compile the client assets and backend server:
```bash
npm run build
npm start
```
