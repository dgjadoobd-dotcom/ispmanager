import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeletePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName: string;
  customerCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeletePackageDialog({
  open,
  onOpenChange,
  packageName,
  customerCount,
  onConfirm,
  isLoading,
}: DeletePackageDialogProps) {
  const hasCustomers = customerCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasCustomers ? "Cannot Delete Package" : "Delete Package"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasCustomers ? (
              <>
                The package <strong>"{packageName}"</strong> currently has{" "}
                <strong>{customerCount}</strong> customer(s). Please move the
                customers to another package before deleting.
              </>
            ) : (
              <>
                Are you sure you want to delete the package{" "}
                <strong>"{packageName}"</strong>? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!hasCustomers && (
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
