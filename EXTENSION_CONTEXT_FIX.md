# Extension Context Invalidation Fix

## Problem Summary
When the extension is reloaded/updated while a LinkedIn or Naukri tab is already open, the injected content scripts become "stale" — their connection to the service worker is severed. If these stale scripts try to call `chrome.* APIs`, Chrome throws:
```
Extension context invalidated
```

This causes:
1. ❌ The entire click handler to crash
2. ❌ Job tracking to stop completely on that tab
3. ❌ Error spam in the browser console

## Solution Implemented

### 1. New Context Guard Utility (`extension/core/context.js`)
Created a dedicated module with safe wrappers:

- **`isExtensionContextValid()`** — Returns `true` if extension context is still valid
- **`safeSendMessage()`** — Wraps `chrome.runtime.sendMessage`
- **`safeStorageGet()`** — Wraps `chrome.storage.local.get`
- **`safeStorageSet()`** — Wraps `chrome.storage.local.set`

Each wrapper:
- ✅ Checks context validity before calling
- ✅ Catches invalidation errors gracefully
- ✅ Returns `null` or `false` instead of throwing
- ✅ Logs warnings without crashing

### 2. Updated Files

#### `extension/shared.js`
- Imported context guard utilities
- Wrapped all `chrome.*` calls:
  - `sendJobToBackground()` — Safe sendMessage wrapper
  - `cacheExternalApplyJob()` — Safe storage get/set wrappers
  - `checkForPendingJob()` — Safe storage get wrapper

All functions now gracefully exit if context is invalid.

#### `extension/content-linkedin.js`
- Added context guard import
- Updated initialization to use `isExtensionContextValid()`
- **Critical fix**: Added guard at the start of global click listener
  - If context is invalid, exits silently instead of crashing
  - Logs helpful message to user

#### `extension/content-naukri.js`
- Added context guard import
- **Critical fix**: Added guard at the start of global click listener
  - Same protection as LinkedIn

## User Experience

### Before Fix
1. User has LinkedIn open
2. Extension gets reloaded/updated
3. Click on job → **CRASH** (Extension context invalidated)
4. Job tracking broken until page reload

### After Fix
1. User has LinkedIn open
2. Extension gets reloaded/updated
3. Click on job → Silently exits with warning
4. User sees notification: "Extension context lost - Please reload this page (F5)"
5. User reloads page → Fresh content script injected → Works perfectly

## How It Works

```
Extension reloaded/updated
        │
        ▼
Service worker restarts (fresh context)
        │
        ▼
All previously injected content scripts → STALE (context severed)
        │
        ├─ isExtensionContextValid() → false
        │  ↓
        ├─ Guard check succeeds → Exit gracefully
        │
        └─ User reloads LinkedIn tab
           ↓
           Fresh content script injected
           ↓
           isExtensionContextValid() → true
           ↓
           Works perfectly again
```

## Testing Checklist

- [ ] Reload extension in chrome://extensions
- [ ] Open LinkedIn with job listings
- [ ] Click "Easy Apply" → Should show warning and not crash
- [ ] Click submit → Should handle gracefully
- [ ] Reload the page (F5)
- [ ] Click "Easy Apply" again → Should work normally
- [ ] Repeat same steps on Naukri

## Key Mental Model

**You cannot heal a stale content script.** Once the context is severed by an extension reload, the only correct fix is:
1. ✅ Detect invalidation gracefully
2. ✅ Exit without crashing
3. ✅ Ask user to reload the page

The stale script dies permanently. A fresh reload injects a new script with a valid context.
