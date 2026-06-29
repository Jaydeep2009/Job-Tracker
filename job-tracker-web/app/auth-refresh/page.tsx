"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

// Silent token refresh page — opened as hidden tab by extension
// Closes itself after sending fresh token back
export default function AuthRefreshPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const extensionId = params.get("ext");

    if (!extensionId) return;

    const unsub = auth.onAuthStateChanged(async (user) => {
      unsub();

      if (!user) {
        // User logged out — tell extension, don't close yet
        // @ts-ignore
        chrome.runtime.sendMessage(extensionId, {
          type: 'AUTH_TOKEN_REFRESH',
          success: false,
          reason: 'logged_out'
        });
        return;
      }

      try {
        // forceRefresh = true — always get a fresh token
        const token = await user.getIdToken(true);

        // Send fresh token back to extension
        // @ts-ignore
        chrome.runtime.sendMessage(extensionId, {
          type: 'AUTH_TOKEN_REFRESH',
          success: true,
          token,
        }, () => {
          // Close this tab once extension confirms receipt
          window.close();
        });
      } catch {
        // @ts-ignore
        chrome.runtime.sendMessage(extensionId, {
          type: 'AUTH_TOKEN_REFRESH',
          success: false,
          reason: 'refresh_failed'
        });
      }
    });
  }, []);

  // Invisible — user never sees this
  return null;
}