import { info, error as logError, warn } from './core/logger.js';
import { showPageNotification, showExtensionInvalidWarning } from './ui/notifications.js';
import {
  sendJobToBackground,
  cacheExternalApplyJob,
  checkForPendingJob
} from './shared.js';
import { extractJob, getPlatformName, detectApplyType } from './services/jobExtractor.js';
import { isExtensionContextValid } from './core/context.js';


info("Content script loaded");

// Check if extension context is valid on load
let extensionContextValid = isExtensionContextValid();

if (extensionContextValid) {
  try {
    info("Extension version:", chrome.runtime.getManifest().version);
    info("Running on:", window.location.href);
  } catch (error) {
    extensionContextValid = false;
    logError("Extension context invalid on load");
    showExtensionInvalidWarning();
  }
} else {
  logError("Extension context invalid on load");
  // Show persistent warning banner
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showExtensionInvalidWarning);
  } else {
    showExtensionInvalidWarning();
  }
}

// Global error handler for extension context errors
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Extension context invalidated')) {
    event.preventDefault();
    if (extensionContextValid) {
      extensionContextValid = false;
      showExtensionInvalidWarning();
    }
  }
});

// Suppress harmless Chrome extension resource errors in console
const originalError = console.error;
console.error = function(...args) {
  const errorString = args.join(' ');
  
  // Ignore chrome-extension://invalid errors (Chrome internal quirk)
  if (errorString.includes('chrome-extension://invalid')) {
    return;
  }
  
  // Show banner for extension context errors but don't spam console
  if (errorString.includes('Extension context invalidated')) {
    if (extensionContextValid) {
      extensionContextValid = false;
      showExtensionInvalidWarning();
    }
    return; // Don't log to console, banner is enough
  }
  
  originalError.apply(console, args);
};

let isProcessing = false;
let cachedJobData = null;
let lastApplyType = null;
let processingQueue = [];

/**
 * Process job queue
 */
async function processJobQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  
  isProcessing = true;
  const job = processingQueue.shift();
  
  console.log(`[JobTracker] Processing job from queue (${processingQueue.length} remaining):`, job.jobTitle);
  
  try {
    await sendJobToBackground(job.data, job.platform);
  } catch (error) {
    logError("Failed to process job:", error);
  }
  
  isProcessing = false;
  
  // Process next job in queue (reduced delay)
  if (processingQueue.length > 0) {
    setTimeout(processJobQueue, 50); // Reduced from 500ms to 100ms
  }
}

/**
 * Extract job details using jobExtractor service
 */
function extractJobDetails() {
  return extractJob();
}


/**
 * Cache job data when Easy Apply starts
 */
function cacheJobData() {
  const data = extractJobDetails();

  if (data.jobTitle && data.companyName) {
    cachedJobData = data;
    info("Job data cached:", {
      jobTitle: cachedJobData.jobTitle,
      companyName: cachedJobData.companyName,
    });
  } else {
    warn("Could not cache job data - missing title or company");
  }
}


async function waitForLinkedInSuccessModal() {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {

      const modal = document.querySelector('[role="dialog"]');

      if (!modal) return;

      const text = (modal.innerText || "").toLowerCase();

      if (
        text.includes("application sent") ||
        text.includes("your application was sent") ||
        text.includes("done")
      ) {
        observer.disconnect();
        resolve(true);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Fallback — if nothing changes
    setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, 4000);
  });
}



/**
 * FINAL handler – ONLY after submit
 */
async function handleSubmitApplication() {

  // 1) Ensure this runs only for EASY APPLY submit press
  if (lastApplyType !== "EASY_APPLY") {
    info("Not an Easy Apply flow, skipping");
    return;
  }

  info("Submit clicked - processing application");

  // 2) Wait for LinkedIn internal processing
  await new Promise(r => setTimeout(r, 1000));

  // 3) ---- ABSOLUTE CONFIRMATION LOGIC ----

  const confirmed = await waitForLinkedInSuccessModal();

  if (!confirmed) {
    info("❌ LinkedIn did not show success banner");
    return;
  }

  info("✅ LinkedIn submission confirmed");

  // 4) Get job data only after success
  const jobData = cachedJobData || extractJobDetails();

  // 5) Validate critical fields
  if (!jobData || !jobData.jobTitle || !jobData.companyName) {
    warn("Incomplete job data:", jobData);
    lastApplyType = null;
    return;
  }

  // 6) Add to processing queue
  processingQueue.push({
    data: jobData,
    platform: getPlatformName(),
    jobTitle: jobData.jobTitle
  });

  console.log(
    `[JobTracker] Added to queue (${processingQueue.length} jobs pending)`
  );

  // 7) Reset flow marker
  lastApplyType = null;

  // 8) Start queue processing
  processJobQueue();
}


/**
 * Handle external apply button clicks
 */
function handleExternalApply() {
  info("External apply triggered");
  lastApplyType = "EXTERNAL_APPLY";

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    warn("Missing job data for external apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  cacheExternalApplyJob(jobData, getPlatformName());
}

// Check for pending job when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkForPendingJob);
} else {
  checkForPendingJob();
}

/**
 * GLOBAL click listener with comprehensive button detection
 */
document.addEventListener("click", async (e) => {
  // Check if extension is enabled
  const { extensionEnabled } = await chrome.storage.local.get({ extensionEnabled: true });
  if (!extensionEnabled) {
    info('Extension is disabled, skipping job tracking');
    return;
  }

  // Try to find button element
  let button = e.target;
  
  // Traverse up to find button (max 5 levels)
  for (let i = 0; i < 5 && button && button !== document.body; i++) {
    if (button.tagName === "BUTTON" || button.getAttribute("role") === "button") {
      break;
    }
    button = button.parentElement;
  }

  if (!button || (button.tagName !== "BUTTON" && button.getAttribute("role") !== "button")) {
    return;
  }

  // Use jobExtractor to detect button type
  const applyType = detectApplyType(button);
  
  info("Button clicked, type:", applyType);

  if (applyType === 'EASY_APPLY') {
    info("✅ Easy Apply button detected!");
    lastApplyType = "EASY_APPLY";
    cacheJobData();
    return;
  }

  if (applyType === 'SUBMIT') {
    info("✅ Submit button detected!");
    handleSubmitApplication();
    return;
  }

  if (applyType === 'EXTERNAL_APPLY') {
    info("✅ External Apply button detected!");
    handleExternalApply();
    return;
  }
}, true);
 // Use capture phase to catch events earlier

info("Event listeners attached");
