"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/firebase";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobsPagination } from "@/components/JobsPagination";
import { ExternalLink } from "lucide-react";

type Job = {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  jobUrl: string;
  platform: "LINKEDIN" | "NAUKRI" | "INTERNSHALA";
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedAt: string;
};

interface JobsTableProps {
  statusFilter: string;
  platformFilter: string;
  searchQuery: string;
}

export function JobsTable({ statusFilter, platformFilter }: JobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Wait for Firebase auth before fetching
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setAuthReady(true);
      // no redirect here — layout.tsx handles that
    });
    return () => unsub();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, platformFilter]);

  // Fetch from server with filters — no client-side filtering needed
  useEffect(() => {
    if (!authReady) return;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
        });

        // Pass filters to backend — your service now supports these
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (platformFilter !== "ALL") params.set("platform", platformFilter);

        const data = await apiFetch(`/api/jobs?${params.toString()}`);
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error loading jobs:", err);
        // don't redirect — layout handles auth, this is a data error
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [authReady, currentPage, statusFilter, platformFilter]);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      await apiFetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: newStatus as Job["status"] } : job
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  if (!authReady || loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2">
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No applications found.
            </div>
          ) : (
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Company</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Role</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Location</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Platform</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Status</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Applied</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Link</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="border border-gray-300 font-semibold">
                      {job.companyName}
                    </TableCell>
                    <TableCell className="border border-gray-300">{job.jobTitle}</TableCell>
                    <TableCell className="border border-gray-300">{job.location || "-"}</TableCell>
                    <TableCell className="uppercase text-xs border border-gray-300">
                      {job.platform}
                    </TableCell>
                    <TableCell className="border border-gray-300">
                      <Select
                        value={job.status}
                        onValueChange={(value) => updateJobStatus(job.id, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPLIED">Applied</SelectItem>
                          <SelectItem value="INTERVIEW">Interview</SelectItem>
                          <SelectItem value="OFFER">Offer</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs border border-gray-300">
                      {new Date(job.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs border border-gray-300">
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>

                    <TableCell className="border border-gray-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => deleteJob(job.id, job.jobTitle)}
                        title="Delete job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <JobsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}