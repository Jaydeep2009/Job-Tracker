import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobFiltersProps {
  statusFilter: string;
  platformFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export const JobFilters = React.memo(({
  statusFilter,
  platformFilter,
  searchQuery,
  onStatusChange,
  onPlatformChange,
  onSearchChange,
  onReset
}: JobFiltersProps) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block px-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="w-[160px]">
        <label className="text-sm font-medium mb-2 block px-2">Status</label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="APPLIED">Applied</SelectItem>
            <SelectItem value="INTERVIEW">Interview</SelectItem>
            <SelectItem value="OFFER">Offer</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px]">
        <label className="text-sm font-medium mb-2 block px-2">Platform</label>
        <Select value={platformFilter} onValueChange={onPlatformChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Platforms</SelectItem>
            <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
            <SelectItem value="NAUKRI">Naukri</SelectItem>
            <SelectItem value="INTERNSHALA">Internshala</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
});

JobFilters.displayName = "JobFilters";

