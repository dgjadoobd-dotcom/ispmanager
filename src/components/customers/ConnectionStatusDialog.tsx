import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, CheckCircle, Wifi } from "lucide-react";
import type { ConnectionStatus } from "@/types";

interface ConnectionStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerId: string;
  currentStatus: ConnectionStatus;
  targetStatus: ConnectionStatus;
  onConfirm: (customerId: string, status: ConnectionStatus, reason?: string) => Promise<void>;
}

export function ConnectionStatusDialog({
  open,
  onOpenChange,
  customerName,
  customerId,
  currentStatus,
  targetStatus,
  onConfirm,
}: ConnectionStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const isSuspending = targetStatus === "suspended";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(customerId, targetStatus, reason);
      onOpenChange(false);
      setReason("");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDetails = () => {
    switch (targetStatus) {
      case "active":
        return {
          icon: CheckCircle,
          iconColor: "text-primary",
          title: "Activate Connection",
          description: `Are you sure you want to activate the connection for ${customerName}? They will be able to use internet services immediately.`,
          confirmText: "Activate",
          confirmVariant: "default" as const,
        };
      case "suspended":
        return {
          icon: AlertTriangle,
          iconColor: "text-destructive",
          title: "Suspend Connection",
          description: `Are you sure you want to suspend the connection for ${customerName}? They will lose internet access immediately.`,
          confirmText: "Suspend",
          confirmVariant: "destructive" as const,
        };
      case "pending":
        return {
          icon: Wifi,
          iconColor: "text-muted-foreground",
          title: "Set as Pending",
          description: `Set connection status to pending for ${customerName}?`,
          confirmText: "Set Pending",
          confirmVariant: "secondary" as const,
        };
      default:
        return {
          icon: Wifi,
          iconColor: "text-muted-foreground",
          title: "Update Status",
          description: `Update connection status for ${customerName}?`,
          confirmText: "Update",
          confirmVariant: "default" as const,
        };
    }
  };

  const details = getStatusDetails();
  const StatusIcon = details.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isSuspending ? "bg-destructive/10" : "bg-primary/10"
            }`}>
              <StatusIcon className={`h-5 w-5 ${details.iconColor}`} />
            </div>
            <AlertDialogTitle>{details.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {details.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isSuspending && (
          <div className="space-y-2 py-2">
            <Label htmlFor="reason">Reason for Suspension (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Non-payment, Customer request, Technical issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setReason("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={details.confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {details.confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
