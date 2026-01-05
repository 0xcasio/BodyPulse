# AI Agent Prompt: InBody Scan Analyzer

Use this prompt to instruct an AI coding agent to build the InBody Scan Analyzer application.

---

## Prompt

You are building a web application called **InBody Scan Analyzer** that helps users understand their body composition data from InBody scans. The app should be simple, visually clean, and focused on making complex health metrics easy to understand.

### Project Overview

Build a Next.js web app where users can:
1. Upload an InBody scan image (photo or PDF)
2. Have AI extract all the metrics from the scan
3. See their results explained in plain English with visual indicators
4. Save multiple scans and track progress over time
5. Generate shareable summary cards

### Tech Stack

- **Framework**: Next.js 16.1+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) or local storage for MVP
- **File Storage**: Supabase Storage or Cloudflare R2
- **Charts**: Recharts
- **AI Vision API**: [INSERT YOUR PREFERRED VISION API HERE - e.g., OpenAI GPT-4V, Anthropic Claude, Google Gemini]

### Core Features to Build

#### 1. Scan Upload & AI Extraction

Create an upload flow that:
- Accepts JPG, PNG, HEIC, and PDF files
- Shows a loading state while processing
- Sends the image to a vision AI API with a structured extraction prompt
- Displays extracted data for user review and manual correction
- Saves confirmed data to the database

**AI Extraction Prompt to Use:**

```
Analyze this InBody body composition scan and extract all visible metrics. Return the data as a JSON object with the following structure:

{
  "scan_date": "YYYY-MM-DD (if visible)",
  "weight": { "value": number, "unit": "kg" or "lbs" },
  "skeletal_muscle_mass": { "value": number, "unit": "kg" or "lbs" },
  "body_fat_mass": { "value": number, "unit": "kg" or "lbs" },
  "body_fat_percentage": number,
  "bmi": number,
  "total_body_water": { "value": number, "unit": "L" },
  "intracellular_water": { "value": number, "unit": "L" },
  "extracellular_water": { "value": number, "unit": "L" },
  "ecw_ratio": number,
  "segmental_lean": {
    "right_arm": { "mass": number, "percentage": number },
    "left_arm": { "mass": number, "percentage": number },
    "trunk": { "mass": number, "percentage": number },
    "right_leg": { "mass": number, "percentage": number },
    "left_leg": { "mass": number, "percentage": number }
  },
  "basal_metabolic_rate": number,
  "visceral_fat_level": number,
  "inbody_score": number,
  "phase_angle": number or null
}

If any value is not visible or unclear, set it to null. Extract numbers exactly as shown on the scan.
```

#### 2. Results Dashboard

Create a dashboard that displays:

**Summary Section (top of page)**
- InBody Score with visual gauge
- Weight, Muscle Mass, Body Fat % as large, prominent cards
- Overall status indicator (e.g., "Looking Good" / "On Track" / "Room to Improve")

**Detailed Sections (expandable cards)**

Each metric should show:
- The value
- A plain-English explanation
- A visual indicator (use colored dots or bars: green = healthy range, yellow = borderline, red = needs attention)
- An actionable tip where relevant

**Metric Explanations to Include:**

| Metric | Healthy Range | Explanation |
|--------|---------------|-------------|
| Body Fat % | Men: 10-20%, Women: 18-28% | The percentage of your total weight that is fat tissue |
| Skeletal Muscle Mass | Varies by height/weight | The weight of your muscles (excluding smooth and cardiac muscle) |
| ECW Ratio | 0.36-0.39 | Ratio of water outside cells to total water. Higher values may indicate inflammation or fluid retention |
| Visceral Fat Level | 1-9 (healthy), 10-14 (high), 15+ (very high) | Fat stored around your organs. Lower is better for metabolic health |
| Phase Angle | 5-7° (healthy adult) | Indicates cell health and integrity. Higher generally means better cell function |
| BMR | Varies | Calories your body burns at complete rest. Use this as baseline for nutrition planning |

**Segmental Analysis Section**
- Body diagram showing left/right arms, trunk, left/right legs
- Color-coded by muscle development (below average / average / above average)
- Highlight any imbalances between left and right sides

#### 3. Progress Tracking

Create a history view that:
- Lists all uploaded scans by date
- Shows a comparison view when selecting two scans
- Displays trend charts for key metrics:
  - Body composition over time (stacked area: muscle vs fat)
  - Weight line chart
  - Body fat % line chart
- Change indicators between scans (↑ +2.3 lbs, ↓ -1.2%)

#### 4. Shareable Summary Card

Create a component that:
- Generates a visually appealing card (like a social media graphic)
- Shows: Date, key metrics (weight, muscle, body fat %), change from previous scan
- Has 2-3 theme options (light, dark, branded)
- Exports as PNG for download
- Use html2canvas or similar for image generation

### Data Model

```typescript
interface Scan {
  id: string;
  userId: string;
  scanDate: Date;
  createdAt: Date;
  sourceImageUrl: string;
  extractionConfidence: number;
  
  // Core metrics
  weight: number;
  weightUnit: 'kg' | 'lbs';
  skeletalMuscleMass: number;
  bodyFatMass: number;
  bodyFatPercentage: number;
  bmi: number;
  
  // Body water
  totalBodyWater: number;
  intracellularWater: number;
  extracellularWater: number;
  ecwRatio: number;
  
  // Segmental
  segmentalLean: {
    rightArm: { mass: number; percentage: number };
    leftArm: { mass: number; percentage: number };
    trunk: { mass: number; percentage: number };
    rightLeg: { mass: number; percentage: number };
    leftLeg: { mass: number; percentage: number };
  };
  
  // Metabolic
  basalMetabolicRate: number;
  visceralFatLevel: number;
  
  // Scores
  inbodyScore: number;
  phaseAngle: number | null;
  
  // Edit tracking
  manuallyEdited: boolean;
  editedFields: string[];
}
```

### UI/UX Guidelines

**Design Principles:**
- Clean, minimal interface with lots of white space
- Mobile-first (most users will upload from phones)
- Use a calming color palette (avoid aggressive reds for "bad" metrics)
- Progress-focused language ("You've gained 2 lbs of muscle!" vs "Muscle mass: 85 lbs")

**Color Coding:**
- Green: #10B981 (healthy range)
- Yellow: #F59E0B (borderline/watch)
- Blue: #3B82F6 (neutral/informational)
- Avoid red for health metrics (use orange sparingly: #F97316)

**Typography:**
- Large, readable numbers for key metrics
- Smaller explanatory text in gray
- Use system fonts for performance (Inter or system-ui)

### File Structure

```
/app
  /page.tsx                 # Landing/upload page
  /dashboard/[scanId]
    /page.tsx               # Individual scan results
  /history
    /page.tsx               # All scans list
  /compare
    /page.tsx               # Side-by-side comparison
  /api
    /extract
      /route.ts             # AI extraction endpoint
    /scans
      /route.ts             # CRUD for scans
/components
  /upload
    /ScanUploader.tsx
    /ExtractionReview.tsx
  /dashboard
    /MetricCard.tsx
    /SegmentalDiagram.tsx
    /ScoreGauge.tsx
  /charts
    /CompositionChart.tsx
    /TrendLine.tsx
  /share
    /SummaryCard.tsx
/lib
  /ai.ts                    # Vision API integration
  /metrics.ts               # Metric explanations & ranges
  /supabase.ts              # Database client
/types
  /scan.ts                  # TypeScript interfaces
```

### Implementation Order

1. **Phase 1: Core Upload Flow**
   - Basic Next.js setup with Tailwind
   - File upload component
   - AI extraction API route
   - Extraction review UI
   - Local storage for MVP (no auth)

2. **Phase 2: Dashboard**
   - Single scan results page
   - Metric cards with explanations
   - Segmental body diagram
   - Score gauge component

3. **Phase 3: History & Comparison**
   - Scan history list
   - Trend charts
   - Side-by-side comparison view

4. **Phase 4: Sharing**
   - Summary card generator
   - PNG export
   - Theme options

### Environment Variables Needed

```
# AI Vision API
VISION_API_KEY=your_api_key_here
VISION_API_ENDPOINT=https://api.example.com/v1/vision

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Additional Notes

- Start with local storage to validate the concept before adding auth
- The AI extraction won't be perfect—always show users the extracted data and let them edit
- InBody printouts vary by machine model; the AI prompt should be robust to different layouts
- Consider adding a "demo mode" with sample data for users who want to explore before uploading

### Success Criteria

The MVP is complete when:
- [ ] User can upload an InBody scan image
- [ ] AI extracts metrics with >80% accuracy on standard InBody 570/770 printouts
- [ ] Dashboard explains each metric in plain English
- [ ] User can save and view multiple scans
- [ ] User can compare two scans side-by-side
- [ ] User can export a shareable summary card

---

*Prompt Version: 1.0*
