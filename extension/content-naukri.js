// =====================================
// JobTracker – Naukri Job Application Tracker
// =====================================
import { info, error as logError } from './core/logger.js';
import { showPageNotification } from './ui/notifications.js';
import {
  sendJobToBackground,
  cacheExternalApplyJob,
  checkForPendingJob
} from './shared.js';
import { extractJob, getPlatformName, detectApplyType } from './services/jobExtractor.js';

info("Naukri content script loaded");
info("Running on:", window.location.href);


console.log("[JobTracker] Naukri content script loaded");
console.log("[JobTracker] Running on:", window.location.href);

let isProcessing = false;
let processingQueue = [];

/**
 * Process job queue
 */
async function processJobQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  
  isProcessing = true;
  const job = processingQueue.shift();
  
  console.log(`[JobTracker] Processing Naukri job from queue (${processingQueue.length} remaining):`, job.jobTitle);
  
  try {
    await sendJobToBackground(job.data, job.platform);
  } catch (error) {
    console.error("[JobTracker] Failed to process job:", error);
  }
  
  isProcessing = false;
  
  // Process next job in queue (reduced delay)
  if (processingQueue.length > 0) {
    setTimeout(processJobQueue, 100); // Reduced from 500ms to 100ms
  }
}

/**
 * Extract job details using jobExtractor service
 */
function extractJobDetails() {
  return extractJob();
}


/**
 * Handle direct apply button click (applies on Naukri directly)
 */
function handleDirectApply() {
  console.log("[JobTracker] Naukri direct apply button clicked");

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Missing job data for Naukri apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  // Add to queue instead of processing immediately
  processingQueue.push({
    data: jobData,
    platform: getPlatformName(),
    jobTitle: jobData.jobTitle
  });
  
  console.log(`[JobTracker] Added to queue (${processingQueue.length} jobs pending)`);
  
  // Wait for Naukri to process, then start queue (reduced delay)
  setTimeout(() => {
    processJobQueue();
  }, 1000); // Reduced from 2000ms to 1000ms
}

/**
 * Handle external apply button click (redirects to company site)
 */
function handleExternalApply() {
  console.log("[JobTracker] Naukri external apply button clicked");

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Missing job data for Naukri apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  // Cache job for later confirmation (like LinkedIn external apply)
  cacheExternalApplyJob(jobData, getPlatformName());
}

/**
 * Detect apply button clicks
 * 
 * Naukri apply button patterns:
 * - "Apply on company site"
 * - class: "company-site-button"
 * - id: "company-site-button"
 */
document.addEventListener("click", async (e) => {
  // Check if extension is enabled
  const { extensionEnabled } = await chrome.storage.local.get({ extensionEnabled: true });
  if (!extensionEnabled) {
    info('Extension is disabled, skipping job tracking');
    return;
  }

  const button = e.target?.closest(
    "#apply-button, #company-site-button"
  );

  if (!button) return;

  // Use jobExtractor to detect button type
  const applyType = detectApplyType(button);
  
  info("Naukri button clicked, type:", applyType);

  if (applyType === 'EXTERNAL_APPLY') {
    info("✅ Naukri External Apply button detected!");
    handleExternalApply();
    return;
  }

  if (applyType === 'DIRECT_APPLY') {
    info("✅ Naukri Direct Apply button detected!");
    handleDirectApply();
    return;
  }
}, true);


// Check for pending job when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkForPendingJob);
} else {
  checkForPendingJob();
}
