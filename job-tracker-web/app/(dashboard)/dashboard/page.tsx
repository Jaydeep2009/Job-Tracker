"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

import { DashboardStats } from "@/components/DashboardStats";
import { JobFilters } from "@/components/JobFilters";
import { JobsTable } from "@/components/JobsTable";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Filter state (managed by parent, passed to children)
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Stats state (for DashboardStats component)
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState({
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });

  // Fetch stats from dedicated endpoint
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiFetch("/api/jobs/stats");
        setTotalJobs(data.total || 0);
        setStats({
          applied: data.APPLIED || 0,
          interview: data.INTERVIEW || 0,
          offer: data.OFFER || 0,
          rejected: data.REJECTED || 0,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [router]);

  const resetFilters = () => {
    setStatusFilter("ALL");
    setPlatformFilter("ALL");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-10">
      {/* Summary Cards */}
      <DashboardStats totalJobs={totalJobs} stats={stats} />

      {/* Filters + Search */}
      <JobFilters
        statusFilter={statusFilter}
        platformFilter={platformFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onPlatformChange={setPlatformFilter}
        onSearchChange={setSearchQuery}
        onReset={resetFilters}
      />

      {/* Jobs Table - re-fetches when filters, search, or page changes */}
      <JobsTable
        statusFilter={statusFilter}
        platformFilter={platformFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}
