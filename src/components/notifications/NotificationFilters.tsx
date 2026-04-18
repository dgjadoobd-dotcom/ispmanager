import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  type: string;
  status: string;
  search: string;
  onTypeChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export function NotificationFilters({
  type,
  status,
  search,
  onTypeChange,
  onStatusChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="billing_reminder">Billing Reminder</SelectItem>
          <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
          <SelectItem value="connection_status">Connection Status</SelectItem>
          <SelectItem value="general">General</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
