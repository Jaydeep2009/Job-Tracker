/**
 * Extension Context Validator
 * Handles graceful degradation when extension context is invalidated
 * (e.g., after extension reload/update while content script is still alive)
 */

/**
 * Returns true if the extension context is still valid.
 * Once context is invalidated (after extension reload/update),
 * all chrome.* API calls will throw. This guard prevents those crashes.
 * 
 * @returns {boolean} true if extension context is valid
 */
export function isExtensionContextValid() {
  try {
    // Accessing chrome.runtime.id will throw if context is invalidated
    return !!chrome.runtime.id;
  } catch (err) {
    return false;
  }
}

/**
 * Safe wrapper around chrome.runtime.sendMessage.
 * Returns null silently if context is invalidated instead of throwing.
 * 
 * @param {object} message - Message object to send
 * @param {function} callback - Callback function (optional)
 * @returns {Promise<any>|null} Promise with response or null if context invalid
 */
export function safeSendMessage(message, callback) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping sendMessage');
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during sendMessage');
            return resolve(null);
          }
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }

        // Call original callback if provided
        if (callback) callback(response);
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - sendMessage');
        resolve(null);
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Safe wrapper around chrome.storage.local.get
 * Returns null if context is invalidated instead of throwing.
 * 
 * @param {string|array|object} keys - Keys to retrieve
 * @returns {Promise<object|null>} Object with stored values or null if context invalid
 */
export function safeStorageGet(keys) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.get');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.get');
            return resolve(null);
          }
          console.error('[JobTracker] Storage error:', chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.get');
        resolve(null);
      } else {
        console.error('[JobTracker] Unexpected storage error:', err);
        resolve(null);
      }
    }
  });
}

/**
 * Safe wrapper around chrome.storage.local.set
 * Returns false if context is invalidated instead of throwing.
 * 
 * @param {object} items - Items to store
 * @returns {Promise<boolean>} true if successful, false if context invalid
 */
export function safeStorageSet(items) {
  if (!isExtensionContextValid()) {
    console.warn('[JobTracker] Extension context invalid, skipping storage.set');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    try {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            console.warn('[JobTracker] Extension context invalidated during storage.set');
            return resolve(false);
          }
          console.error('[JobTracker] Storage error:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      if (err.message?.includes('Extension context invalidated')) {
        console.warn('[JobTracker] Extension context invalidated - storage.set');
        resolve(false);
      } else {
        console.error('[JobTracker] Unexpected storage error:', err);
        resolve(false);
      }
    }
  });
}
