# Phase 2 Testing Guide

## ✅ Pre-Testing Checklist

- [x] Supabase project created
- [x] Database schema executed
- [x] Storage bucket `scan-images` created
- [x] Environment variables configured
- [x] All TypeScript errors fixed
- [x] Dependencies installed

## 🧪 Testing Procedure

### 1. Start the Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 2. Test Upload Flow & Database Saving

**Steps:**
1. Go to the home page (`/`)
2. Upload a scan image (use `scans/19.10.2023.jpg` or your own)
3. Wait for AI extraction
4. Review the extracted data on `/review`
5. Click "Confirm & View Dashboard"

**Expected Results:**
- ✅ Scan uploads successfully
- ✅ AI extraction works (or falls back to demo data)
- ✅ Review page shows extracted metrics
- ✅ After confirming, scan is saved to Supabase database
- ✅ Check Supabase dashboard → Table Editor → `scans` table should have a new row
- ✅ Check Supabase Storage → `scan-images` bucket should have the uploaded image

**Verify in Supabase:**
- Go to Supabase Dashboard → Table Editor → `scans`
- You should see a new row with all the extracted data
- Check that `source_image_url` points to the uploaded image

### 3. Test History Page

**Steps:**
1. Navigate to `/history` (click "History" in navbar)
2. Verify your uploaded scan appears
3. Test date filters (1 month, 3 months, etc.)
4. Check that charts render (if you have 2+ scans)

**Expected Results:**
- ✅ History page loads without errors
- ✅ Your scan appears in the timeline
- ✅ Date filters work correctly
- ✅ Charts display (if multiple scans exist)
- ✅ "Upload New Scan" button works
- ✅ Clicking "View Details" navigates to dashboard

**Verify:**
- Scan card shows correct date, weight, body fat %, InBody Score
- Trend indicators (↑↓) appear if you have multiple scans
- Progress summary shows correct calculations

### 4. Test Comparison View

**Steps:**
1. Go to `/history`
2. Click "Compare" on a scan card
3. Select two scans from the dropdowns
4. Review the side-by-side comparison

**Expected Results:**
- ✅ Comparison page loads
- ✅ Can select two scans from dropdowns
- ✅ Side-by-side layout displays correctly
- ✅ Change indicators show correctly (↑↓ with colors)
- ✅ Percentage changes calculate correctly
- ✅ "View Full Dashboard" links work

**Verify:**
- Green indicators for improvements
- Orange/amber indicators for declines
- All key metrics compared (weight, body fat, muscle, InBody Score)

### 5. Test Trend Charts

**Steps:**
1. Ensure you have at least 2 scans in history
2. Go to `/history`
3. Scroll to "Progress Trends" section
4. Verify all charts render

**Expected Results:**
- ✅ Weight Trend chart displays
- ✅ Body Fat % Trend chart displays
- ✅ Muscle Mass Trend chart displays
- ✅ InBody Score Trend chart displays
- ✅ Body Composition (stacked area) chart displays
- ✅ Charts are responsive (try resizing browser)
- ✅ Tooltips work on hover

**Verify:**
- Charts show data points for each scan
- X-axis shows dates correctly
- Y-axis shows values with proper units
- Charts are readable on mobile

### 6. Test Shareable Summary Cards

**Steps:**
1. Go to `/dashboard` (view a scan)
2. Click "Export Card" button
3. Modal should open with preview
4. Click "Download as PNG"
5. Verify PNG downloads

**Expected Results:**
- ✅ Export modal opens
- ✅ Card preview displays correctly
- ✅ PNG download works
- ✅ Downloaded image is readable
- ✅ Card shows key metrics and date

**Verify:**
- Card includes: date, weight, body fat %, muscle mass, InBody Score
- If previous scan exists, shows change indicators
- Image quality is good (not pixelated)

### 7. Test PDF Upload

**Steps:**
1. Go to home page
2. Upload a PDF file (if you have one)
3. Verify extraction works

**Expected Results:**
- ✅ PDF upload accepted
- ✅ Extraction processes PDF
- ✅ Data extracted correctly (or falls back to demo)

**Note:** PDF support depends on Claude's ability to read PDFs. If it fails, the app should gracefully fall back to demo data.

### 8. Test Navigation

**Steps:**
1. Navigate through all pages
2. Test navbar links
3. Test back buttons

**Expected Results:**
- ✅ Navbar appears on all pages
- ✅ "Upload" link works
- ✅ "History" link works
- ✅ Active state highlights current page
- ✅ Back buttons navigate correctly
- ✅ Breadcrumbs work (if implemented)

### 9. Test Database Persistence

**Steps:**
1. Upload a scan and save it
2. Close the browser
3. Reopen and go to `/history`
4. Verify scan still appears

**Expected Results:**
- ✅ Data persists after browser close
- ✅ Scans load from database on page refresh
- ✅ No data loss

### 10. Test Error Handling

**Steps:**
1. Try uploading an invalid file type
2. Try accessing `/dashboard` without a scan
3. Try accessing `/history` with no scans

**Expected Results:**
- ✅ Invalid file shows error message
- ✅ Missing scan redirects appropriately
- ✅ Empty states display correctly
- ✅ No console errors

## 🐛 Common Issues & Solutions

### Issue: "Supabase not configured" warning
**Solution:** Check `.env` file has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: Storage upload fails
**Solution:** 
- Verify `scan-images` bucket exists in Supabase
- Check bucket is set to "Public" or RLS policies allow uploads
- Verify service role key is set (if using server-side uploads)

### Issue: Charts don't render
**Solution:**
- Ensure you have at least 2 scans
- Check browser console for errors
- Verify Recharts is installed: `npm list recharts`

### Issue: Export card doesn't download
**Solution:**
- Check browser console for errors
- Verify html2canvas is installed: `npm list html2canvas`
- Try a different browser

### Issue: TypeScript errors
**Solution:** Run `npx tsc --noEmit` to see all errors, then fix them

## 📊 Success Criteria

Phase 2 is successfully tested when:

- [x] All TypeScript errors resolved
- [ ] Can upload and save scans to database
- [ ] History page displays all scans
- [ ] Comparison view works with 2+ scans
- [ ] Charts render correctly
- [ ] Export card downloads as PNG
- [ ] Navigation works on all pages
- [ ] Data persists across sessions
- [ ] No console errors during normal use

## 📝 Testing Notes

Document any issues you find:

1. **Issue Description:**
2. **Steps to Reproduce:**
3. **Expected Behavior:**
4. **Actual Behavior:**
5. **Browser/OS:**
6. **Console Errors (if any):**

---

**Last Updated:** After Phase 2 Implementation
**Status:** Ready for Testing ✅


