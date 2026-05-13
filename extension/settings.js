(function () {
  'use strict';

  (function () {

    /**
     * Chrome Storage Wrapper
     * Provides promise-based interface for chrome.storage operations
     */

    /**
     * Get value from chrome.storage.sync
     * @param {string|string[]} key - Key or array of keys
     * @returns {Promise<any>}
     */
    async function get(key) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(typeof key === 'string' ? result[key] : result);
          }
        });
      });
    }

    /**
     * Set value in chrome.storage.sync
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    async function set(key, value) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }

    /**
     * Remove value from chrome.storage.sync
     * @param {string|string[]} key
     * @returns {Promise<void>}
     */
    async function remove(key) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }

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

    // Settings page script

    document.addEventListener('DOMContentLoaded', async () => {
      await loadCurrentSettings();
      
      document.getElementById('saveBtn').addEventListener('click', saveSettings);
      document.getElementById('resetBtn').addEventListener('click', resetSettings);
      document.getElementById('devMode').addEventListener('change', handleDevModeToggle);
    });

    async function loadCurrentSettings() {
      try {
        const result = await get([
          'apiUrl',
          'dashboardUrl',
          'devMode'
        ]);
        const { apiUrl, dashboardUrl, devMode } = result;
        
        // Load form values
        document.getElementById('backendUrl').value = apiUrl || '';
        document.getElementById('dashboardUrl').value = dashboardUrl || '';
        document.getElementById('devMode').checked = devMode || false;
        
        // Update current config display
        const backendUrl = await getBackendUrl();
        const dashUrl = await getDashboardUrl();
        
        document.getElementById('currentBackend').textContent = backendUrl;
        document.getElementById('currentDashboard').textContent = dashUrl;
        document.getElementById('currentMode').textContent = devMode ? 'Development' : 'Production';
        
      } catch (error) {
        showMessage('Failed to load settings', 'error');
        console.error('Error loading settings:', error);
      }
    }

    async function saveSettings() {
      const backendUrl = document.getElementById('backendUrl').value.trim();
      const dashboardUrl = document.getElementById('dashboardUrl').value.trim();
      const devMode = document.getElementById('devMode').checked;
      
      // Validate URLs if provided
      if (backendUrl && !isValidUrl(backendUrl)) {
        showMessage('Invalid backend URL', 'error');
        return;
      }
      
      if (dashboardUrl && !isValidUrl(dashboardUrl)) {
        showMessage('Invalid dashboard URL', 'error');
        return;
      }
      
      try {
        await set('apiUrl', backendUrl || null);
        await set('dashboardUrl', dashboardUrl || null);
        await set('devMode', devMode);
        
        showMessage('Settings saved successfully!', 'success');
        
        // Reload current config display
        setTimeout(() => loadCurrentSettings(), 500);
        
      } catch (error) {
        showMessage('Failed to save settings', 'error');
        console.error('Error saving settings:', error);
      }
    }

    async function resetSettings() {
      if (!confirm('Reset to default production URLs?')) {
        return;
      }
      
      try {
        await remove(['apiUrl', 'dashboardUrl', 'devMode']);
        
        // Clear form
        document.getElementById('backendUrl').value = '';
        document.getElementById('dashboardUrl').value = '';
        document.getElementById('devMode').checked = false;
        
        showMessage('Settings reset to defaults', 'success');
        
        // Reload current config display
        setTimeout(() => loadCurrentSettings(), 500);
        
      } catch (error) {
        showMessage('Failed to reset settings', 'error');
        console.error('Error resetting settings:', error);
      }
    }

    function handleDevModeToggle(e) {
      const isDevMode = e.target.checked;
      const backendInput = document.getElementById('backendUrl');
      const dashboardInput = document.getElementById('dashboardUrl');
      
      if (isDevMode) {
        // Suggest localhost URLs
        if (!backendInput.value) {
          backendInput.placeholder = 'http://localhost:4000 (suggested)';
        }
        if (!dashboardInput.value) {
          dashboardInput.placeholder = 'http://localhost:3000 (suggested)';
        }
      } else {
        // Reset placeholders
        backendInput.placeholder = 'https://your-backend.com';
        dashboardInput.placeholder = 'https://your-dashboard.com';
      }
    }

    function isValidUrl(string) {
      try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    }

    function showMessage(message, type) {
      const statusEl = document.getElementById('statusMessage');
      statusEl.textContent = message;
      statusEl.className = `status-message ${type}`;
      statusEl.style.display = 'block';
      
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    }

  })();

})();
