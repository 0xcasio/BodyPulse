# AI Personalized Guidance System

## Overview

Add an on-demand AI-powered guidance feature that generates personalized nutrition and exercise recommendations based on user goals, lifestyle preferences, and InBody scan results. The system will be conservative, evidence-based, and include appropriate disclaimers.

**Users can choose between two guidance types:**
- **General Guidance**: Quick, high-level recommendations with key priorities and tips (faster, lower cost)
- **Comprehensive Guidance**: Detailed meal ideas, specific workout plans, macro breakdowns, and in-depth analysis (more thorough, higher cost)

## Architecture

```
User Profile (goals, lifestyle, preferences)
    +
Latest Scan Data (body composition metrics)
    +
Historical Trends (progress over time)
    ↓
AI Prompt Engineering (structured, safe, evidence-based)
    ↓
Claude API Call (using existing Anthropic integration)
    ↓
Structured Response (nutrition + exercise guidance)
    ↓
Display in UI (formatted, shareable)
```

## Implementation Plan

### Phase 1: Data Collection & Storage

**1.1 Extend User Profile Schema**
- File: `lib/db/add-user-profile.sql` (or create new migration)
- Add fields:
  - `fitness_goals`: TEXT[] (e.g., ['lose_fat', 'build_muscle', 'maintain', 'improve_composition'])
  - `activity_level`: TEXT (sedentary, lightly_active, moderately_active, very_active, extremely_active)
  - `dietary_preferences`: TEXT[] (e.g., ['vegetarian', 'vegan', 'keto', 'paleo', 'no_restrictions'])
  - `food_allergies`: TEXT[]
  - `favorite_foods`: TEXT[] (optional, for personalization)
  - `workout_preferences`: TEXT[] (e.g., ['strength_training', 'cardio', 'yoga', 'home_workouts', 'gym'])
  - `time_availability`: TEXT (low, medium, high) - for workout duration
  - `previous_general_guidance_requests`: TIMESTAMP[] (for rate limiting - store last 3 requests)
  - `previous_comprehensive_guidance_requested_at`: TIMESTAMP (for rate limiting)

**1.2 Update TypeScript Types**
- File: `types/user.ts`
- Extend `UserProfile` interface with new fields

**1.3 Create Profile Questionnaire Component**
- File: `components/settings/GoalsSection.tsx` (new)
- Collect:
  - Primary fitness goal (single select)
  - Activity level (single select)
  - Dietary preferences (multi-select)
  - Food allergies (multi-select with text input)
  - Workout preferences (multi-select)
  - Time availability (single select)
- Save to user profile via `updateUserProfile`

### Phase 2: AI Guidance Generation

**2.1 Create Guidance Prompt Templates**
- File: `lib/ai/guidance.ts` (new)
- Build two prompt templates:

  **General Guidance Prompt:**
  - Concise, high-level recommendations
  - Focus on key priorities and actionable tips
  - Shorter response format
  - Includes: `key_priorities`, `quick_tips`, `nutrition_overview`, `exercise_overview`, `timeline_expectations`

  **Comprehensive Guidance Prompt:**
  - Detailed, thorough analysis
  - Specific meal ideas and workout plans
  - In-depth macro breakdowns and explanations
  - Includes: `nutrition_guidance` (detailed meal ideas, macro targets, calorie recommendation, tips), `exercise_guidance` (workout types, frequency, duration, focus areas, tips), `general_recommendations` (key priorities, timeline expectations, warnings), `detailed_analysis` (body composition insights, progress interpretation)

- Both prompts include:
  - User profile data (goals, preferences, activity level)
  - Latest scan metrics (weight, body fat %, muscle mass, BMR, etc.)
  - Trend data (changes over time if available)
  - Safety constraints:
    - "Do not provide medical advice"
    - "Base recommendations on evidence-based practices"
    - "Respect dietary restrictions and allergies"
    - "Consider user's activity level and time availability"

**2.2 Create Guidance API Endpoint**
- File: `app/api/guidance/route.ts` (new)
- Validates user authentication
- Accepts query parameter: `type` ('general' | 'comprehensive')
- Fetches user profile and latest scan
- Calculates trends (if multiple scans exist)
- Calls AI guidance generation with appropriate prompt template based on type
- Returns structured guidance with `guidance_type` field
- Implements rate limiting:
  - General: 3 requests per 24 hours per user
  - Comprehensive: 1 request per 24 hours per user

**2.3 Add Guidance Generation Functions**
- File: `lib/ai/guidance.ts`
- Function: `generatePersonalizedGuidance(userProfile, latestScan, scanHistory, guidanceType: 'general' | 'comprehensive')`
- Uses existing Anthropic client from `lib/ai.ts`
- Selects appropriate prompt template based on `guidanceType`
- Returns structured guidance object with `guidance_type` field

### Phase 3: UI Components

**3.1 Create Guidance Request Component**
- File: `components/guidance/GuidanceButton.tsx` (new)
- Place on:
  - Dashboard scan detail page (`app/dashboard/[scanId]/page.tsx`)
  - History page (`app/history/page.tsx`)
- Provides two options:
  - "Get General Guidance" button (quick, free/low-cost)
  - "Get Comprehensive Plan" button (detailed, premium)
- Or dropdown/selector to choose guidance type
- Shows loading state during generation
- Handles errors gracefully
- Displays rate limit status (e.g., "2 general requests remaining today")

**3.2 Create Guidance Display Component**
- File: `components/guidance/GuidanceCard.tsx` (new)
- Displays guidance based on type:
  
  **General Guidance Display:**
  - Key priorities (bullet points)
  - Quick nutrition tips
  - Quick exercise tips
  - Timeline expectations
  - Compact, scannable format

  **Comprehensive Guidance Display:**
  - Detailed nutrition section (meal ideas, macros, calorie targets, tips)
  - Detailed exercise section (workout types, frequency, duration, focus areas, tips)
  - General recommendations (key priorities, timeline expectations, warnings)
  - Detailed analysis (body composition insights, progress interpretation)
  - Expandable sections for better organization

- Both include:
  - Guidance type badge/indicator
  - Generated timestamp
  - Disclaimer footer: "This guidance is for informational purposes only and is not medical advice. Consult with a healthcare professional before making significant changes to your diet or exercise routine."

**3.3 Create Guidance Modal/Page**
- File: `app/guidance/page.tsx` (new) OR modal component
- Full-screen view of guidance
- Option to save/export guidance (text or PDF)
- Link to update profile if incomplete

### Phase 4: Safety & Quality

**4.1 Add Disclaimers**
- All guidance displays must include medical disclaimer
- Terms of service update (if applicable)

**4.2 Implement Rate Limiting**
- Different limits for each guidance type:
  - General: 3 requests per 24 hours
  - Comprehensive: 1 request per 24 hours
- Store `previous_general_guidance_requests` (array of timestamps) and `previous_comprehensive_guidance_requested_at` in user profile
- Or use separate tracking table for better rate limiting
- Show friendly message if limit reached with countdown timer
- Display remaining requests in UI

**4.3 Add Profile Completion Check**
- Before generating guidance, check if profile is complete
- If incomplete, prompt user to complete questionnaire first
- Link to settings page

**4.4 Error Handling**
- Handle API failures gracefully
- Show user-friendly error messages
- Log errors for debugging

## Technical Details

### Prompt Engineering Strategy

The AI prompt should:
1. **Context Setting**: "You are a fitness and nutrition advisor providing evidence-based guidance..."
2. **Data Input**: Include structured user data (profile + scan metrics)
3. **Constraints**: Safety rules, dietary restrictions, activity level
4. **Output Format**: Structured JSON with specific sections
5. **Tone**: Encouraging, practical, realistic

### Example Prompt Structures

#### General Guidance Prompt

```
Based on the following user profile and body composition scan data, provide concise, high-level personalized guidance.

USER PROFILE:
- Goal: [lose_fat/build_muscle/maintain]
- Activity Level: [sedentary/lightly_active/etc]
- Dietary Preferences: [vegetarian/vegan/etc]
- Allergies: [list]
- Workout Preferences: [strength_training/cardio/etc]
- Time Availability: [low/medium/high]

LATEST SCAN DATA:
- Weight: [X] lbs
- Body Fat %: [X]%
- Skeletal Muscle Mass: [X] lbs
- BMR: [X] calories
- InBody Score: [X]

TREND DATA (if available):
- Weight change: [X] lbs over [Y] days
- Body fat change: [X]% over [Y] days

Provide concise guidance in this JSON format (keep responses brief and actionable):
{
  "key_priorities": ["priority1", "priority2", "priority3"],
  "nutrition_overview": "Brief summary of nutrition focus",
  "exercise_overview": "Brief summary of exercise focus",
  "quick_tips": ["tip1", "tip2", "tip3"],
  "timeline_expectations": "Brief realistic timeline text"
}

IMPORTANT: Keep responses concise and actionable. Focus on the most important recommendations.
```

#### Comprehensive Guidance Prompt

```
Based on the following user profile and body composition scan data, provide detailed, comprehensive personalized nutrition and exercise guidance.

USER PROFILE:
- Goal: [lose_fat/build_muscle/maintain]
- Activity Level: [sedentary/lightly_active/etc]
- Dietary Preferences: [vegetarian/vegan/etc]
- Allergies: [list]
- Workout Preferences: [strength_training/cardio/etc]
- Time Availability: [low/medium/high]

LATEST SCAN DATA:
- Weight: [X] lbs
- Body Fat %: [X]%
- Skeletal Muscle Mass: [X] lbs
- BMR: [X] calories
- InBody Score: [X]

TREND DATA (if available):
- Weight change: [X] lbs over [Y] days
- Body fat change: [X]% over [Y] days

Provide comprehensive guidance in this JSON format:
{
  "nutrition_guidance": {
    "weekly_meal_ideas": ["detailed idea1", "detailed idea2", ...],
    "macro_targets": { "protein": "Xg", "carbs": "Yg", "fats": "Zg" },
    "calorie_recommendation": "X calories/day",
    "meal_timing_tips": ["tip1", "tip2", ...],
    "tips": ["detailed tip1", "detailed tip2", ...]
  },
  "exercise_guidance": {
    "workout_types": ["type1", "type2", ...],
    "frequency": "X times per week",
    "duration": "X minutes per session",
    "focus_areas": ["area1", "area2", ...],
    "sample_workout_structure": "Detailed workout structure",
    "progression_plan": "How to progress over time",
    "tips": ["detailed tip1", "detailed tip2", ...]
  },
  "general_recommendations": {
    "key_priorities": ["priority1", "priority2", ...],
    "timeline_expectations": "Detailed realistic timeline text",
    "warnings": ["warning1", "warning2", ...]
  },
  "detailed_analysis": {
    "body_composition_insights": "Analysis of current body composition",
    "progress_interpretation": "What the trends mean",
    "strengths": ["strength1", "strength2", ...],
    "areas_for_improvement": ["area1", "area2", ...]
  }
}

IMPORTANT CONSTRAINTS:
- Do not provide medical advice
- Respect all dietary restrictions and allergies
- Base recommendations on evidence-based practices
- Consider user's activity level and time availability
- Be realistic about timelines and expectations
- Provide detailed, actionable recommendations
```

## Files to Create/Modify

### New Files
- `lib/db/add-guidance-fields.sql` - Database migration
- `lib/ai/guidance.ts` - AI guidance generation logic
- `app/api/guidance/route.ts` - API endpoint
- `components/settings/GoalsSection.tsx` - Profile questionnaire
- `components/guidance/GuidanceButton.tsx` - Trigger button
- `components/guidance/GuidanceCard.tsx` - Display component
- `app/guidance/page.tsx` - Guidance page (optional, could be modal)

### Modified Files
- `types/user.ts` - Add new profile fields
- `lib/db/users.ts` - Update `updateUserProfile` to handle new fields
- `components/settings/ProfileSection.tsx` - Add link to goals section
- `app/settings/page.tsx` - Add GoalsSection component
- `app/dashboard/[scanId]/page.tsx` - Add GuidanceButton
- `app/history/page.tsx` - Add GuidanceButton (optional)

## Cost Considerations

- **General Guidance API Cost**: ~$0.005-0.01 per generation (shorter prompt, Claude 3 Haiku)
- **Comprehensive Guidance API Cost**: ~$0.02-0.03 per generation (longer prompt, Claude 3 Haiku)
- **Rate Limiting**:
  - General: 3 requests/day = max $0.03/user/day = $0.90/user/month
  - Comprehensive: 1 request/day = max $0.03/user/day = $0.90/user/month
- **Recommendation**: Implement rate limiting to control costs, consider upgrading to Claude 3.5 Sonnet for comprehensive guidance if quality is important

## Success Metrics

- % of users who complete profile questionnaire
- % of users who request guidance
- User satisfaction with guidance quality
- Guidance request frequency

## Future Enhancements (Out of Scope for MVP)

- Multiple guidance versions (regenerate)
- Save guidance history
- Compare guidance over time
- Integration with meal planning apps
- Integration with workout apps
- A/B testing different prompt strategies

## Implementation Todos

1. **extend-user-profile**: Add new fields to user profile schema (fitness_goals, activity_level, dietary_preferences, etc.) in database migration
2. **update-types**: Update TypeScript UserProfile interface with new guidance-related fields (depends on: extend-user-profile)
3. **create-goals-section**: Create GoalsSection component for collecting user goals, preferences, and lifestyle data (depends on: update-types)
4. **create-guidance-prompt**: Create two AI guidance prompt templates (general and comprehensive) in lib/ai/guidance.ts with safety constraints and structured output formats
5. **create-guidance-api**: Create API endpoint /api/guidance that accepts guidance type parameter, fetches user data, calls AI with appropriate prompt, and returns structured guidance with type-specific rate limiting (depends on: create-guidance-prompt, update-types)
6. **create-guidance-ui**: Create GuidanceButton (with type selector) and GuidanceCard components (with type-specific display logic) to trigger and display AI-generated guidance (depends on: create-guidance-api)
7. **integrate-guidance-button**: Add GuidanceButton to dashboard scan detail page and optionally history page (depends on: create-guidance-ui)
8. **add-disclaimers**: Add medical disclaimers to all guidance displays and implement profile completion checks (depends on: create-guidance-ui)

