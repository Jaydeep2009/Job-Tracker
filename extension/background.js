import { registerHandlers } from './core/messaging.js';
import { info, error as logError } from './core/logger.js';
import { JobQueue } from './services/JobQueue.js';
import { ApiClient } from './services/ApiClient.js';
import { getLocal, setLocal, get, set, remove } from './core/storage.js';
import { getDashboardUrl } from './config.js';

info("Background service worker started");

// Initialize services
const apiClient = new ApiClient();
const jobQueue = new JobQueue();

// Override JobQueue's _sendJob to use ApiClient
jobQueue._sendJob = async (job) => {
  const result = await apiClient.saveJob(job);
  
  // 💾 Increment cached job count on successful save
  const currentCount = await getLocal('jobCount');
  if (currentCount !== undefined && currentCount !== null) {
    await setLocal('jobCount', currentCount + 1);
    info('Job count cache incremented:', currentCount + 1);
  }
  
  return result;
};

// Initialize API client
apiClient.init();

// Register message handlers
registerHandlers({
  'JOB_APPLICATION': handleJobApplication,
  'EXTERNAL_APPLY_CACHED': handleExternalApply,
  'UPDATE_BADGE': handleUpdateBadge,
  'CLEAR_BADGE': handleClearBadge,
  'RETRY_FAILED': handleRetryFailed,
  'TOGGLE_EXTENSION': handleToggleExtension
});

// ===============================
// External Message Listener (for website auth)
// ===============================
chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    info('Received external message:', request.type);
    
    // Handle auth token from website
    if (request.type === 'AUTH_TOKEN' && request.token) {
      try {
        // Store token in chrome.storage.sync
        await set('authToken', request.token);
        info('Auth token received and stored from website');
        
        // Notify all extension contexts that auth succeeded
        chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' }).catch(() => {
          // Ignore errors if popup is not open
        });
        
        sendResponse({ success: true });
      } catch (error) {
        logError('Failed to store auth token:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep channel open for async response
    }

    // Add this alongside your existing AUTH_TOKEN handler
  if (request.type === 'AUTH_TOKEN_REFRESH') {
    if (request.success && request.token) {
      const expiryTime = new Date(Date.now() + 55 * 60 * 1000).toISOString(); // 55 min
      await set('authToken', request.token);
      await set('tokenExpiry', expiryTime);
      info('Token silently refreshed, expires:', expiryTime);
      sendResponse({ success: true });
    } else {
      // User logged out of dashboard — clear extension auth too
      await remove(['authToken', 'tokenExpiry']);
      // Notify popup if open
      chrome.runtime.sendMessage({ type: 'AUTH_LOGGED_OUT' }).catch(() => {});
      sendResponse({ success: false });
    }
    return true;
}
    
    sendResponse({ success: false, error: 'Unknown message type' });
  }
);

// Handler functions

async function handleJobApplication(data) {
  info('Received job application:', data.jobTitle);
  
  try {
    // Add to queue (will process automatically)
    await jobQueue.add(data);
    
    // Show success notification
    showNotification('success', data);
    
    return { success: true };
  } catch (error) {
    logError('Failed to handle job application:', error);
    showNotification('error', null, error.message);
    throw error;
  }
}


async function handleExternalApply(data) {
  // Show browser notification for external apply
  showExternalApplyNotification(data.count);
  
  // Set badge on extension icon
  chrome.action.setBadgeText({ text: String(data.count) });
  chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  
  return { success: true };
}

async function handleUpdateBadge(data) {
  const count = data.count || 0;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  }
  return { success: true };
}

async function handleClearBadge() {
  chrome.action.setBadgeText({ text: "" });
  return { success: true };
}

async function handleRetryFailed() {
  info('Retrying failed jobs');
  await jobQueue.retryFailed();
  return { success: true };
}

async function handleToggleExtension(data) {
  const enabled = data.enabled;
  info(`Extension toggled: ${enabled ? 'ON' : 'OFF'}`);
  
  // Store state
  await chrome.storage.local.set({ extensionEnabled: enabled });
  
  // Update badge to indicate state
  if (!enabled) {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
  
  return { success: true };
}

// Notification functions

function showNotification(type, jobData, errorMessage) {
  const notificationOptions = {
    type: "basic",
    iconUrl: "icons/icon128.jpg",
    title: "",
    message: "",
    priority: 2
  };

  if (type === "success") {
    notificationOptions.title = "✅ Job Application Tracked!";
    notificationOptions.message = `${jobData.jobTitle} at ${jobData.companyName} has been saved to your dashboard.`;
  } else {
    notificationOptions.title = "❌ Failed to Track Application";
    notificationOptions.message = errorMessage || "Could not save job application. Please check your connection and try again.";
  }

  chrome.notifications.create(`jobtracker-${Date.now()}`, notificationOptions);
}

function showExternalApplyNotification(count) {
  const notificationOptions = {
    type: "basic",
    iconUrl: "icons/icon128.jpg",
    title: "💼 Job Saved - Action Required",
    message: `You have ${count} pending job${count > 1 ? 's' : ''} waiting for confirmation.\n\n✓ After you apply on their website, click the extension icon (with badge ⓵) to confirm and save to your dashboard.`,
    priority: 2,
    requireInteraction: true
  };

  chrome.notifications.create(`jobtracker-external-${Date.now()}`, notificationOptions);
}

// Add this function to background.js
async function silentTokenRefresh() {
  const dashboardUrl = await getDashboardUrl();
  const extensionId = chrome.runtime.id;

  return new Promise((resolve) => {
    // Open hidden tab to dashboard refresh page
    chrome.tabs.create({
      url: `${dashboardUrl}/auth-refresh?ext=${extensionId}`,
      active: false, // ← hidden, doesn't interrupt user
    }, (tab) => {
      // Listen for the response
      const listener = (request, sender) => {
        if (request.type === 'AUTH_TOKEN_REFRESH' && sender.tab?.id === tab.id) {
          chrome.runtime.onMessageExternal.removeListener(listener);
          chrome.tabs.remove(tab.id).catch(() => {});
          resolve(request.success);
        }
      };
      chrome.runtime.onMessageExternal.addListener(listener);

      // Timeout after 10 seconds — don't hang forever
      setTimeout(() => {
        chrome.tabs.remove(tab.id).catch(() => {});
        resolve(false);
      }, 10000);
    });
  });
}

// Export for ApiClient to trigger via message
registerHandlers({
  // ...your existing handlers...
  'REFRESH_TOKEN': async () => {
    const success = await silentTokenRefresh();
    return { success };
  }
});
