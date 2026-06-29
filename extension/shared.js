/**
 * Shared business logic utilities
 * UI functions have been moved to ui/notifications.js and ui/modals.js
 */

import { showPageNotification, showExternalApplyNotification } from './ui/notifications.js';
import { showConfirmationModal } from './ui/modals.js';
import { info, error as logError } from './core/logger.js';
import { 
  isExtensionContextValid,
  safeSendMessage, 
  safeStorageGet, 
  safeStorageSet 
} from './core/context.js';

/**
 * Send job application to background
 */
async function sendJobToBackground(jobData, platform) {
  info(`Sending ${platform} job data to background`, {
    jobTitle: jobData.jobTitle,
    companyName: jobData.companyName,
  });

  // Guard: if extension context is invalid, bail out gracefully
  if (!isExtensionContextValid()) {
    logError("Extension context invalid, cannot send job to background");
    showPageNotification("⚠️ Extension context lost - Please reload this page (F5)", "error");
    return;
  }

  const response = await safeSendMessage({
    type: "JOB_APPLICATION",
    data: { ...jobData, platform },
  });

  if (response === null) {
    // Context was invalidated during the call
    showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
    return;
  }

  info("Background response:", response);
  
  if (response?.success) {
    showPageNotification("✅ Job tracked successfully!", "success");
  } else {
    showPageNotification("❌ Failed to track job: " + (response?.error || "Unknown error"), "error");
  }
}

/**
 * Cache external apply job
 */
async function cacheExternalApplyJob(jobData, platform) {
  info(`Caching ${platform} external apply job`, {
    jobTitle: jobData.jobTitle,
    companyName: jobData.companyName,
  });

  // Guard: if extension context is invalid, bail out gracefully
  if (!isExtensionContextValid()) {
    logError("Extension context invalid, cannot cache job");
    showPageNotification("⚠️ Extension context lost - Please reload this page (F5)", "error");
    return;
  }

  const result = await safeStorageGet("pendingJobs");

  if (result === null) {
    // Context was invalidated during the call
    showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
    return;
  }

  const { pendingJobs } = result;
  const jobs = pendingJobs || [];
  
  const newJob = {
    ...jobData,
    id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    platform,
    status: "APPLIED",
    timestamp: Date.now(),
  };
  
  const exists = jobs.some(job => job.jobUrl === newJob.jobUrl);
  if (exists) {
    info("Job already in pending queue");
    showPageNotification("⚠️ Job already saved", "error");
    return;
  }
  
  jobs.push(newJob);
  
  const saved = await safeStorageSet({ pendingJobs: jobs });

  if (!saved) {
    // Context was invalidated or storage failed
    showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
    return;
  }

  info(`External apply job cached successfully. Total pending: ${jobs.length}`);
  
  showExternalApplyNotification(jobData);
  
  // Try to send notification to background, but don't fail if context is invalid
  const notifyResponse = await safeSendMessage({ 
    type: "EXTERNAL_APPLY_CACHED",
    count: jobs.length
  });
  
  if (notifyResponse === null) {
    logError("Failed to notify background about external apply");
  }
}

/**
 * Check for pending jobs when page loads
 */
async function checkForPendingJob() {
  // Guard: if extension context is invalid, skip silently
  if (!isExtensionContextValid()) {
    logError("Extension context invalid, cannot check pending jobs");
    return;
  }

  const result = await safeStorageGet("pendingJobs");

  if (result === null) {
    // Context was invalidated during the call
    logError("Extension context invalidated while checking pending jobs");
    return;
  }

  const { pendingJobs } = result;
  if (pendingJobs && pendingJobs.length > 0) {
    info(`Found pending jobs: ${pendingJobs.length}`);
    // Wait a bit for page to load, then show modal
    setTimeout(() => {
      showConfirmationModal(pendingJobs[0]);
    }, 1000);
  }
}

// Export functions for use in content scripts
export {
  sendJobToBackground,
  cacheExternalApplyJob,
  checkForPendingJob
};
