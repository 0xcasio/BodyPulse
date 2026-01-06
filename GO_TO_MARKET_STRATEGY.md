# ScanVault Go-to-Market Strategy

**Created:** January 5, 2025
**Status:** Current app is live on Vercel (private beta - signups locked)

---

## 🎯 Core Recommendation: Launch → Learn → Build

**Skip Phase 3 for now.** Get real users first, then build what they actually ask for.

### Why This Approach?

You already have a compelling MVP:
- ✅ Upload & AI extraction working
- ✅ Beautiful, intuitive dashboard
- ✅ Plain-English explanations (huge differentiator!)
- ✅ History & progress tracking
- ✅ Mobile-responsive
- ✅ Auth & database working
- ✅ Export functionality

**This is already better than 90% of what users currently have (PDF files they can't understand).**

---

## 🚀 Launch Roadmap (Next 30 Days)

### Week 1-2: Validate Market Fit
**Goal:** Get 100 active users

#### User Acquisition Channels:
1. **Reddit Launch**
   - r/fitness (3.5M members)
   - r/bodybuilding (2.8M members)
   - r/loseit (2.4M members)
   - Post title: "I built a free tool that explains your body composition scan in plain English"

2. **Gym Partnerships**
   - Email 20 gyms that have InBody machines
   - Offer: "Free tool for your members to track their scans"
   - Template: "Hi [Gym Owner], I noticed you have an InBody scanner. I built a free tool that helps your members understand and track their results..."

3. **Personal Trainer Outreach**
   - Find 10 trainers who work with clients getting body scans
   - Offer free access + potential white-label version

4. **Content Marketing**
   - Blog post: "What Your InBody Scan Results Actually Mean (Plain English Guide)"
   - TikTok/Instagram Reels: Before/after comparisons using ScanVault
   - YouTube tutorial: "How to Track Your Body Composition Progress"

#### Success Metrics to Track:
- [ ] % of signups who upload first scan (activation rate) - Target: 60%+
- [ ] % who upload second scan (retention) - Target: 30%+
- [ ] Most clicked metrics (tells you what users care about)
- [ ] Time spent on dashboard
- [ ] Feature requests (track in Notion/Linear)

---

### Week 3-4: Monetization Validation
**Goal:** Get first 10 paying customers

#### Pricing Hypothesis to Test:

```
FREE TIER:
- 3 scans max
- Basic metrics only
- 30-day history

PRO TIER ($9/month or $79/year):
- Unlimited scans
- Full metrics & explanations
- Unlimited history
- Progress charts & trends
- PDF export
- Priority support
- Early access to new features
```

**Important:** Don't build all Pro features yet - just see if people **say** they'd pay for them.

#### Revenue Metrics:
- [ ] Conversion rate free → paid - Target: 3-5%
- [ ] Churn rate - Target: <5% monthly
- [ ] Customer lifetime value (LTV)
- [ ] Customer acquisition cost (CAC)
- [ ] LTV:CAC ratio - Target: 3:1 minimum

---

## 🛠️ Critical Pre-Launch Tasks

### MUST DO (1-2 days) - Before Public Launch

#### 1. Rebrand to ScanVault
**Files to update:**
- [ ] `package.json` - name field
- [ ] `app/layout.tsx` - metadata title/description
- [ ] `README.md`
- [ ] All user-facing text mentioning "InBody"
- [ ] Domain/subdomain (e.g., scanvault.app or scanvault.yourname.com)

**Safe terminology to use:**
- ✅ "Compatible with body composition scans"
- ✅ "Bioimpedance analysis tracker"
- ✅ "Works with InBody, Tanita, and other scan formats"
- ❌ "InBody analyzer" (trademark risk)
- ❌ "Official InBody app" (implies partnership)

#### 2. Landing Page
**Location:** `/app/page.tsx` (home page)

**Key sections:**
```
Hero:
- Headline: "Your body composition scans, finally explained"
- Subheadline: "Stop squinting at confusing PDFs. ScanVault turns your body scan results into beautiful, trackable insights—in plain English."
- CTA: "Join the Waitlist" or "Get Early Access"
- Screenshot/demo of dashboard

Problem/Solution:
- Problem: "You get a body composition scan. The results are confusing medical jargon."
- Solution: "ScanVault explains every metric in plain English, tracks your progress, and shows you what to improve."

Features:
- Plain-English explanations for every metric
- Beautiful visualizations
- Progress tracking over time
- Privacy-first (your data stays yours)
- Export and share results

Social Proof:
- "Join 500+ people tracking their body composition" (update number)
- Testimonials (collect from beta users)

CTA:
- Email signup form
- "Join waitlist" button
```

#### 3. Privacy & Legal
**Required for health data:**
- [ ] Privacy Policy (use generator: getterms.io or termly.io)
- [ ] Terms of Service
- [ ] Cookie consent (if using analytics)
- [ ] HIPAA compliance statement (if storing health data in US)
- [ ] Add footer links to privacy/terms pages

#### 4. Error Handling & Reliability
- [ ] Handle failed uploads gracefully (don't crash)
- [ ] Show user-friendly error messages
- [ ] Add retry logic for API failures
- [ ] Test with corrupted/invalid PDF files
- [ ] Add loading states everywhere
- [ ] Test on mobile devices

#### 5. Rate Limiting & Security
- [ ] Use Vercel's built-in rate limiting
- [ ] Limit AI extraction calls per user (e.g., 10/day for free tier)
- [ ] Prevent abuse (file size limits, type validation)
- [ ] Add CSRF protection
- [ ] Sanitize user inputs

---

### IMPORTANT (2-3 days) - For Better UX

#### 6. Onboarding Flow
**First-time user experience:**
```
Step 1: Welcome screen
- "Welcome to ScanVault! Let's upload your first scan."
- Button: "Upload My First Scan"

Step 2: Upload
- Drag-drop area with clear instructions
- "Upload your InBody/body composition scan PDF"
- Show example of what file should look like

Step 3: Processing
- "Analyzing your scan... This takes about 30 seconds"
- Progress indicator
- Fun fact about body composition while waiting

Step 4: First results
- "Here's your dashboard!"
- Highlight key features with tooltips
- "Click any metric to learn what it means"

Step 5: Prompt second scan
- "Upload another scan to see your progress over time"
```

#### 7. Email Notifications
**Use:** Resend.com (free tier: 100 emails/day)

**Email types:**
```
1. Welcome email
   - Subject: "Welcome to ScanVault!"
   - Content: Quick start guide, links to upload

2. Scan processed
   - Subject: "Your scan is ready!"
   - Content: Link to dashboard, highlight interesting findings

3. Weekly summary (for engaged users)
   - Subject: "Your body composition this week"
   - Content: Key changes, motivational message

4. Re-engagement (if inactive 14 days)
   - Subject: "We miss you! Upload a new scan?"
   - Content: Reminder of value prop
```

#### 8. Waitlist System
**Options:**
- Use Tally.so (free, beautiful forms)
- Use Typeform (free tier)
- Build custom with Supabase

**Collect:**
- Email address (required)
- Name (optional)
- "How did you hear about us?" (optional)
- "What gym/scanner do you use?" (optional - helps with partnerships)

**Auto-response email:**
```
Subject: You're on the ScanVault waitlist!

Hey [Name],

Thanks for joining the ScanVault waitlist! We're currently in private beta and limiting signups to ensure a great experience.

We'll invite you within 48 hours. In the meantime:
- Check out our demo: [link]
- Learn what each metric means: [blog post]
- Follow us for updates: [Twitter/Instagram]

Questions? Just reply to this email.

- [Your Name]
Founder, ScanVault
```

#### 9. Analytics
**Recommended:** Plausible or PostHog (both privacy-friendly)

**Track:**
- Page views
- Sign-ups
- Upload events
- Dashboard interactions (which metrics clicked?)
- Retention (daily/weekly active users)
- Conversion funnel: signup → upload → second upload → paid

---

### NICE TO HAVE (Do Later)

These are Phase 3+ features. Build **only if users request them**:
- [ ] Comparison view (side-by-side scans)
- [ ] Advanced progress charts
- [ ] Custom goal setting
- [ ] Mobile app (iOS/Android)
- [ ] API access for developers
- [ ] White-label version for gyms
- [ ] Team/trainer accounts
- [ ] Integration with fitness trackers

---

## 📊 Success Metrics Dashboard

### Week 1-2 (Validation)
- **Signups:** Target 100
- **Activation Rate:** 60%+ (uploaded first scan)
- **Retention:** 30%+ (uploaded second scan)
- **Engagement:** Avg. 3+ metrics clicked per session

### Week 3-4 (Monetization)
- **Trial-to-Paid:** 3-5% conversion
- **Revenue:** $100+ MRR (Monthly Recurring Revenue)
- **Paying Customers:** 10+
- **Churn:** <5% monthly

### Month 2-3 (Growth)
- **Users:** 500+
- **MRR:** $500+
- **Retention:** 40%+ come back monthly
- **NPS Score:** 50+ (would recommend)

---

## 🎯 7-Day Action Plan (This Week)

### Day 1-2: Rebrand & Setup
- [ ] Rename to ScanVault everywhere
- [ ] Update all "InBody" references to generic terms
- [ ] Add privacy policy & terms
- [ ] Set up analytics (Plausible/PostHog)

### Day 3: Landing Page
- [ ] Build simple landing page with value prop
- [ ] Add waitlist form (Tally.so)
- [ ] Add demo screenshots/video

### Day 4: Launch Content
- [ ] Write Reddit post (draft below)
- [ ] Create Twitter/X thread
- [ ] Prepare Instagram/TikTok content

### Day 5-6: Soft Launch
- [ ] Post to Reddit r/fitness
- [ ] Share on Twitter/X
- [ ] Email 10 friends to try it
- [ ] Watch analytics closely

### Day 7: Iterate
- [ ] Review user feedback
- [ ] Fix critical bugs
- [ ] Invite next batch from waitlist

---

## 📝 Launch Post Templates

### Reddit Post Template

**Title:** "I built a free tool that explains your body composition scan in plain English"

**Body:**
```
Hey r/fitness!

Ever get a body composition scan (InBody, Tanita, etc.) and the results look like this? [screenshot of confusing PDF]

I got tired of not understanding what all those numbers meant, so I built **ScanVault** - a free tool that:
- Explains every metric in plain English
- Tracks your progress over time
- Shows you what to focus on improving
- Works on your phone

It's in early access right now. If you want to try it, here's the link: [your link]

Would love feedback from this community!

---
Edit: Wow, thanks for all the interest! A few FAQs:
- It's completely free during beta
- Your data is private and encrypted
- Works with InBody, Tanita, and most other scan formats
- No app download needed, works in browser
```

### Twitter/X Thread

```
🧵 I spent $60 on a body composition scan and got results that looked like a medical textbook

So I built a free tool that explains it in plain English

Here's what I learned about making health data actually useful 👇

[1/8]
```

---

## 💰 Monetization Strategy (Month 2+)

### Stripe Integration Steps
1. Create Stripe account
2. Add `@stripe/stripe-js` to package.json
3. Create `/api/checkout` endpoint
4. Add subscription management page
5. Add webhook handler for subscription events

### Pricing Tiers (Validate First!)

**Free:**
- 3 scans max
- Basic metrics
- 30-day history
- Community support

**Pro ($9/month or $79/year):**
- Unlimited scans
- All metrics + explanations
- Unlimited history
- Progress charts
- PDF export
- Priority support
- Early access to features

**Team ($29/month):**
- Everything in Pro
- Up to 5 users
- Client management (for trainers)
- White-label exports
- API access

### Early Adopter Special
- First 100 paid users: $49/year (lifetime price lock)
- Creates urgency
- Rewards early supporters
- Builds loyal community

---

## 🤔 Decision Framework

Before building ANY new feature, ask:

1. **Did a user request this?** (If no, don't build)
2. **How many users requested it?** (If <5, probably not yet)
3. **Does it help with activation or retention?** (Priority if yes)
4. **Can we test demand without building it?** (Fake door test)
5. **What's the simplest version?** (Ship 20% of idea for 80% value)

---

## 📞 Next Steps

**Tomorrow's session, we should:**
1. Decide on final name (ScanVault or alternative)
2. Update branding across the app
3. Build landing page with waitlist
4. Set up analytics
5. Draft launch posts

**Questions to answer:**
- What domain will you use? (scanvault.app available?)
- Which analytics tool? (Plausible vs PostHog)
- Which email service? (Resend vs SendGrid)
- When do you want to launch? (This week? Next week?)

---

## 🎯 Success Criteria

**We'll know this is working if:**
- [ ] 100+ waitlist signups in first week
- [ ] 60%+ activation rate (upload first scan)
- [ ] Users come back to upload second scan
- [ ] Positive feedback ("This is so helpful!")
- [ ] Feature requests rolling in
- [ ] 5+ people willing to pay

**We'll know we need to pivot if:**
- [ ] <20 signups in first week
- [ ] <20% activation rate
- [ ] Nobody comes back
- [ ] Negative feedback ("I don't get it")
- [ ] No organic sharing/word of mouth

---

**Remember:** Don't fall in love with your solution. Fall in love with the problem. If users don't want this solution, find what they DO want.

🚀 Let's ship it!
