import { getBackendUrl } from '../config.js';
import { info, error as logError } from '../core/logger.js';
import { get } from '../core/storage.js';

export class ApiClient {
  constructor() {
    this.baseUrl = null;
    this._refreshing = false; // prevent concurrent refreshes
  }

  async init() {
    this.baseUrl = await getBackendUrl();
    info('ApiClient initialized:', this.baseUrl);
  }

  async getToken() {
    const result = await get('authToken');
    const authToken = result?.authToken || result;
    if (!authToken) throw new Error('Not authenticated');
    return authToken;
  }

  // Silently refresh token via dashboard, then retry
  async refreshAndRetry(retryFn) {
    if (this._refreshing) {
      // Another call is already refreshing — wait a moment and retry
      await new Promise(r => setTimeout(r, 2000));
      return retryFn();
    }

    this._refreshing = true;
    try {
      info('Token expired — attempting silent refresh');
      const response = await chrome.runtime.sendMessage({ type: 'REFRESH_TOKEN' });

      if (response?.success) {
        info('Silent refresh succeeded — retrying request');
        return retryFn(); // retry original call with fresh token
      } else {
        // User logged out of dashboard — can't refresh
        throw new Error('Session ended — please login again');
      }
    } finally {
      this._refreshing = false;
    }
  }

  async saveJob(jobData) {
    if (!this.baseUrl) await this.init();
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        companyName: jobData.companyName,
        jobTitle: jobData.jobTitle,
        location: jobData.location,
        description: jobData.description,
        jobUrl: jobData.jobUrl,
        platform: jobData.platform || 'LINKEDIN',
        appliedAt: jobData.appliedAt || new Date().toISOString()
      })
    });

    // Silent refresh on 401 — retry once
    if (response.status === 401) {
      return this.refreshAndRetry(() => this.saveJob(jobData));
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  async getJobs(page = 1, limit = 10) {
    if (!this.baseUrl) await this.init();
    const token = await this.getToken();

    const response = await fetch(
      `${this.baseUrl}/api/jobs?page=${page}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (response.status === 401) {
      return this.refreshAndRetry(() => this.getJobs(page, limit));
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }

  async updateJob(id, data) {
    if (!this.baseUrl) await this.init();
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/api/jobs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      return this.refreshAndRetry(() => this.updateJob(id, data));
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
}