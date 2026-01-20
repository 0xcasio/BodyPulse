# Insights Feature - Caching Explained

## How Caching Works

The Insights feature uses **smart client-side caching** to ensure fast performance:

### First Visit (SLOW - 5-10 seconds)
- ⏳ Generates AI insights using Claude API
- 💾 Caches results in browser sessionStorage
- ✅ Shows detailed loading progress

**Console Output:**
```
🆕 No cache found for this scan, generating fresh insights...
💾 Insights cached successfully! Next visit will load instantly.
```

### Subsequent Visits (FAST - instant)
- ⚡ Loads from cache immediately
- 🎯 No API calls needed
- ✅ Same scan = same cached insights

**Console Output:**
```
✅ Loading insights from cache (5 minutes old)
🚀 Cache will remain valid for 1435 more minutes
```

### After New Scan Upload (SLOW again)
- 🆕 New scan ID = new cache key
- ⏳ Generates fresh insights for new scan
- 💾 Caches new results

**Console Output:**
```
🆕 No cache found for this scan, generating fresh insights...
💾 Insights cached successfully! Next visit will load instantly.
```

## Cache Details

- **Storage**: Browser sessionStorage (client-side)
- **Key Format**: `insights_${scanId}`
- **TTL**: 24 hours
- **Invalidation**: Automatic when TTL expires or browser closes
- **Scope**: Per scan (each scan has its own cached insights)

## Why This Design?

✅ **Fast for repeat visits** - No waiting after first generation
✅ **Fresh for new scans** - Each scan gets personalized insights
✅ **Cost-efficient** - Reduces Claude API calls by ~95%
✅ **No database needed** - Simple sessionStorage approach
✅ **Privacy-friendly** - Cache only in user's browser

## How to Verify Caching is Working

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Insights page
4. Watch for cache messages:
   - First visit: "🆕 No cache found"
   - Second visit: "✅ Loading insights from cache"

## Performance Expectations

| Scenario | Load Time | API Calls |
|----------|-----------|-----------|
| First visit for a scan | 5-10 seconds | 1 (Claude AI) |
| Repeat visit (within 24h) | <100ms | 0 (cached) |
| After new scan upload | 5-10 seconds | 1 (Claude AI) |
| Repeat visit to new scan | <100ms | 0 (cached) |

## Future Optimizations (Ideas)

- **Background generation**: Generate insights automatically after scan upload
- **Pre-caching**: Generate insights during scan review step
- **Progressive loading**: Show partial results while generating
- **Server-side caching**: Optional database storage for cross-device access
