import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePackageSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ integrationId, packageId }: { integrationId: string; packageId: string }) => {
      // Simulate sync in local mode
      await new Promise((r) => setTimeout(r, 500));
      return { success: true, message: "Package sync simulated (local mode)" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-sync-queue"] });
      toast.success("প্যাকেজ মাইক্রোটিকে সিঙ্ক হয়েছে");
    },
    onError: (error: Error) => toast.error(`সিঙ্ক ব্যর্থ: ${error.message}`),
  });
}
