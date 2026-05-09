/**
 * Chrome Storage Wrapper
 * Provides promise-based interface for chrome.storage operations
 */

import { isExtensionContextValid } from './context.js';

/**
 * Get value from chrome.storage.sync
 * @param {string|string[]} key - Key or array of keys
 * @returns {Promise<any>}
 */
export async function get(key) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.sync.get');
    return null;
  }
  
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, (result) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.sync.get');
            return resolve(null);
          }
          reject(chrome.runtime.lastError);
        } else {
          resolve(typeof key === 'string' ? result[key] : result);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.sync.get');
        resolve(null);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Set value in chrome.storage.sync
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function set(key, value) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.sync.set');
    return false;
  }
  
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.sync.set');
            return resolve(false);
          }
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.sync.set');
        resolve(false);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Remove value from chrome.storage.sync
 * @param {string|string[]} key
 * @returns {Promise<void>}
 */
export async function remove(key) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.sync.remove');
    return false;
  }
  
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.remove(key, () => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.sync.remove');
            return resolve(false);
          }
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.sync.remove');
        resolve(false);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Get value from chrome.storage.local
 * @param {string|string[]} key
 * @returns {Promise<any>}
 */
export async function getLocal(key) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.local.get');
    return null;
  }
  
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.local.get');
            return resolve(null);
          }
          reject(chrome.runtime.lastError);
        } else {
          resolve(typeof key === 'string' ? result[key] : result);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.local.get');
        resolve(null);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Set value in chrome.storage.local
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function setLocal(key, value) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.local.set');
    return false;
  }
  
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.local.set');
            return resolve(false);
          }
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.local.set');
        resolve(false);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Remove value from chrome.storage.local
 * @param {string|string[]} key
 * @returns {Promise<void>}
 */
export async function removeLocal(key) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.local.remove');
    return false;
  }
  
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.local.remove');
            return resolve(false);
          }
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.local.remove');
        resolve(false);
      } else {
        reject(err);
      }
    }
  });
}

// ===== Job-specific helpers =====

/**
 * Get pending jobs from local storage
 * @returns {Promise<Array>}
 */
export async function getPendingJobs() {
  const result = await getLocal('pendingJobs');
  return result || [];
}

/**
 * Add a job to pending jobs
 * @param {Object} job
 * @returns {Promise<void>}
 */
export async function addPendingJob(job) {
  const jobs = await getPendingJobs();
  jobs.push(job);
  await setLocal('pendingJobs', jobs);
}

/**
 * Remove a job from pending jobs
 * @param {string} jobId
 * @returns {Promise<void>}
 */
export async function removePendingJob(jobId) {
  const jobs = await getPendingJobs();
  const updated = jobs.filter(j => j.id !== jobId);
  await setLocal('pendingJobs', updated);
}

/**
 * Clear all pending jobs
 * @returns {Promise<void>}
 */
export async function clearPendingJobs() {
  await removeLocal('pendingJobs');
}
