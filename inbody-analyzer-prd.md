# InBody Scan Analyzer - Product Requirements Document

## Overview

InBody Scan Analyzer is a web application that helps users understand, track, and share their body composition data from InBody scans. The app uses AI to parse scan images and translate complex metrics into plain-English insights that anyone can understand—regardless of their fitness or nutrition background.

## Problem Statement

InBody scans provide valuable body composition data, but the results are difficult to interpret for non-experts. Users face several pain points:

- **Complexity**: Metrics like ECW ratio, phase angle, and segmental lean analysis are meaningless to most people
- **Fragmentation**: Scan results live across gyms, clinics, and paper printouts with no central storage
- **No context**: Raw numbers don't tell users if they're improving or what actions to take
- **Sharing friction**: Fitness enthusiasts and influencers want to share progress but lack clean, shareable formats

## Target Users

| Segment | Description | Primary Need |
|---------|-------------|--------------|
| Fitness Enthusiasts | Regular gym-goers tracking body composition | Progress tracking, understanding metrics |
| Influencers/Content Creators | People sharing fitness journeys online | Shareable progress cards, visual comparisons |
| Personal Trainers | Coaches monitoring client progress | Client dashboards, explaining results |
| General Health-Conscious Users | Anyone wanting to store health documents | Central storage, simple explanations |

## Solution

A web app that allows users to upload InBody scan images (photo or PDF), automatically extracts the data using AI vision models, and presents interpreted results through an intuitive dashboard with plain-English explanations.

## Core Features (MVP)

### 1. Scan Upload & AI Extraction

**Description**: Users upload a photo or PDF of their InBody scan. The AI extracts all relevant data points.

**Functional Requirements**:
- Accept image formats: JPG, PNG, HEIC, PDF
- Use vision model to parse InBody scan layout
- Extract all standard InBody metrics (see Data Model section)
- Handle different InBody machine models/printout formats
- Show extraction confidence score
- Allow manual correction of extracted values

**User Flow**:
1. User clicks "Upload Scan"
2. Selects file from device or takes photo
3. AI processes image (loading state)
4. Extracted data displayed for review
5. User confirms or edits values
6. Scan saved to history

### 2. Interpreted Dashboard

**Description**: Transform raw metrics into understandable insights with visual indicators.

**Functional Requirements**:
- Display each metric with:
  - The raw value
  - Plain-English explanation of what it means
  - Visual indicator (good/okay/needs attention)
  - Contextual tip for improvement (where applicable)
- Group metrics into logical categories:
  - Body Composition (weight, muscle mass, body fat)
  - Muscle Balance (segmental lean analysis)
  - Hydration (body water, ECW ratio)
  - Metabolic Health (BMR, visceral fat)
- Expandable sections for deeper explanations

**Key Metrics to Interpret**:
- Weight, Skeletal Muscle Mass, Body Fat Mass, Body Fat Percentage
- BMI, Percent Body Fat, Visceral Fat Level
- Total Body Water, Intracellular Water, Extracellular Water, ECW Ratio
- Segmental Lean Analysis (Right Arm, Left Arm, Trunk, Right Leg, Left Leg)
- Basal Metabolic Rate (BMR)
- Phase Angle (if available)
- InBody Score

### 3. Progress Tracking & Comparison

**Description**: Store multiple scans and visualize progress over time.

**Functional Requirements**:
- Timeline view of all scans (chronological)
- Side-by-side comparison of any two scans
- Change indicators (↑↓) with magnitude
- Charts for key metrics over time:
  - Body composition trend (muscle vs fat)
  - Weight trajectory
  - Body fat percentage trend
- Date range filters (1 month, 3 months, 6 months, 1 year, all time)

### 4. Shareable Summary Card

**Description**: Generate clean, visually appealing summary cards for social sharing.

**Functional Requirements**:
- Auto-generated card with key highlights
- Customizable elements:
  - Which metrics to include
  - Date display preference
  - Color theme options
- Export formats: PNG, JPG
- Direct share to social platforms (optional v2)
- Comparison card (before/after)

## Data Model

### Scan Object

```
Scan {
  id: string
  user_id: string
  scan_date: date
  created_at: timestamp
  source_image_url: string
  extraction_confidence: float
  
  // Core Metrics
  weight: float (kg or lbs)
  skeletal_muscle_mass: float
  body_fat_mass: float
  body_fat_percentage: float
  bmi: float
  
  // Body Water
  total_body_water: float
  intracellular_water: float
  extracellular_water: float
  ecw_ratio: float
  
  // Segmental Lean (each as object with value + rating)
  segmental_lean: {
    right_arm: { mass: float, percentage: float }
    left_arm: { mass: float, percentage: float }
    trunk: { mass: float, percentage: float }
    right_leg: { mass: float, percentage: float }
    left_leg: { mass: float, percentage: float }
  }
  
  // Metabolic
  basal_metabolic_rate: float
  visceral_fat_level: int
  
  // Scores
  inbody_score: int
  phase_angle: float (optional)
  
  // User corrections
  manually_edited: boolean
  edited_fields: string[]
}
```

## Technical Architecture

### Frontend
- React (Next.js) for web app
- Tailwind CSS for styling
- Chart.js or Recharts for visualizations
- PWA-ready for mobile experience

### Backend
- Next.js API routes or separate Node.js server
- PostgreSQL or Supabase for data storage
- Cloud storage (S3/Cloudflare R2) for scan images

### AI Integration
- Vision LLM API for image parsing (user-specified)
- Structured output extraction via prompting
- Fallback to manual entry if extraction fails

### Authentication (v1 simplified)
- Magic link email auth OR
- Local storage only (no accounts for MVP)

## User Experience Guidelines

### Design Principles
- **Clarity over completeness**: Show the most important metrics prominently, hide complexity behind expandable sections
- **Encouraging tone**: Frame results positively, focus on progress and actionable insights
- **Visual hierarchy**: Use color coding (green/yellow/red or similar) sparingly and meaningfully
- **Mobile-first**: Most users will upload photos from their phone

### Tone of Explanations
- Conversational, not clinical
- Avoid jargon; when technical terms are necessary, define them inline
- Example: "Your ECW Ratio is 0.38, which is in the healthy range. This measures the balance of water inside vs. outside your cells—a sign your body is retaining fluids normally."

## Success Metrics

| Metric | Target (3 months post-launch) |
|--------|-------------------------------|
| Scans uploaded | 500+ |
| Return users (2+ scans) | 40% |
| Share card exports | 100+ |
| Trainer interest signals | 5+ inquiries |

## Out of Scope (v1)

- User accounts with full authentication (use simple storage)
- Age/gender benchmarking ("you're in the top 20% for your age")
- Multiple scan types (DEXA, blood panels, etc.)
- Native mobile apps
- Social features (following, public profiles)
- Integration with fitness apps (Apple Health, Google Fit)

## Future Considerations (v2+)

- Gym/trainer white-label dashboard (B2B pivot)
- Broader health data aggregation (DEXA, blood work, glucose)
- AI-generated recommendations based on goals
- Community benchmarking with anonymized data
- API for third-party integrations

## Open Questions

1. **Data privacy**: How long do we store scan images? Do we need them after extraction?
2. **Accuracy validation**: How do we verify AI extraction accuracy across different InBody models?
3. **Unit handling**: Support both metric (kg) and imperial (lbs)? Auto-detect or user preference?
4. **Offline support**: Should the app work offline with local storage?

---

*Document Version: 1.0*  
*Last Updated: January 2025*
