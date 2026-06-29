"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";

import { DashboardStats } from "@/components/DashboardStats";
import { JobFilters } from "@/components/JobFilters";
import { JobsTable } from "@/components/JobsTable";

export default function DashboardPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);  // ← new
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState({
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });

  // Step 1 — wait for Firebase to restore session before doing anything
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login"); // not logged in → redirect
      } else {
        setAuthReady(true);   // logged in → allow data fetch
      }
    });
    return () => unsub();
  }, [router]);

  // Step 2 — only fetch after auth is confirmed
  useEffect(() => {
    if (!authReady) return;

    const loadStats = async () => {
      try {
        const data = await apiFetch("/api/jobs/stats"); // use your stats endpoint
        setTotalJobs(data.total || 0);
        setStats({
          applied: data.APPLIED || 0,
          interview: data.INTERVIEW || 0,
          offer: data.OFFER || 0,
          rejected: data.REJECTED || 0,
          applied: data.APPLIED || 0,
          interview: data.INTERVIEW || 0,
          offer: data.OFFER || 0,
          rejected: data.REJECTED || 0,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [authReady]); // ← only runs once auth is confirmed

  const resetFilters = () => {
    setStatusFilter("ALL");
    setPlatformFilter("ALL");
    setSearchQuery("");
  };

  // Show spinner until auth + data are both ready
  if (!authReady || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-10">
      <DashboardStats totalJobs={totalJobs} stats={stats} />
      <JobFilters
        statusFilter={statusFilter}
        platformFilter={platformFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onPlatformChange={setPlatformFilter}
        onSearchChange={setSearchQuery}
        onReset={resetFilters}
      />
      <JobsTable
        statusFilter={statusFilter}
        platformFilter={platformFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}