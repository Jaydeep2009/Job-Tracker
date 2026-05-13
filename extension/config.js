import { get } from './core/storage.js';

const CONFIG = {
  // Default production URLs
  PRODUCTION: {
    BACKEND_URL: "https://job-tracker-production-bfce.up.railway.app",
    DASHBOARD_URL: "https://job-tracker-jwue.vercel.app"
  },
  
  // Development URLs (override via chrome.storage)
  DEVELOPMENT: {
    BACKEND_URL: "http://localhost:4000",
    DASHBOARD_URL: "http://localhost:3000"
  }
};

/**
 * Get the current backend URL
 * Priority: chrome.storage.sync > production default
 */
async function getBackendUrl() {
  try {
    const result = await get(['apiUrl', 'devMode']);
    const { apiUrl, devMode } = result;
    
    // If custom URL is set, use it
    if (apiUrl) {
      return apiUrl;
    }
    
    // If dev mode is enabled, use dev URL
    if (devMode) {
      return CONFIG.DEVELOPMENT.BACKEND_URL;
    }
    
    // Default to production
    return CONFIG.PRODUCTION.BACKEND_URL;
  } catch (error) {
    console.error('[JobTracker] Error getting backend URL:', error);
    return CONFIG.PRODUCTION.BACKEND_URL;
  }
}

/**
 * Get the current dashboard URL
 * Priority: chrome.storage.sync > production default
 */
async function getDashboardUrl() {
  try {
    const result = await get(['dashboardUrl', 'devMode']);
    const { dashboardUrl, devMode } = result;
    
    // If custom URL is set, use it
    if (dashboardUrl) {
      return dashboardUrl;
    }
    
    // If dev mode is enabled, use dev URL
    if (devMode) {
      return CONFIG.DEVELOPMENT.DASHBOARD_URL;
    }
    
    // Default to production
    return CONFIG.PRODUCTION.DASHBOARD_URL;
  } catch (error) {
    console.error('[JobTracker] Error getting dashboard URL:', error);
    return CONFIG.PRODUCTION.DASHBOARD_URL;
  }
}

/**
 * Set custom backend URL
 */
async function setBackendUrl(url) {
  await chrome.storage.sync.set({ apiUrl: url });
}

/**
 * Set custom dashboard URL
 */
async function setDashboardUrl(url) {
  await chrome.storage.sync.set({ dashboardUrl: url });
}

/**
 * Toggle development mode
 */
async function setDevMode(enabled) {
  await chrome.storage.sync.set({ devMode: enabled });
}

/**
 * Reset to production URLs
 */
async function resetToProduction() {
  await chrome.storage.sync.remove(['apiUrl', 'dashboardUrl', 'devMode']);
}

// ES6 exports
export {
  getBackendUrl,
  getDashboardUrl,
  setBackendUrl,
  setDashboardUrl,
  setDevMode,
  resetToProduction,
  CONFIG
};
