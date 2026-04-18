import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface InitiatePaymentParams { billId: string; amount: number; }
interface PaymentResponse { success: boolean; payment_url: string; invoice_id: string; }

export function useInitiatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const mutation = useMutation({
    mutationFn: async (_params: InitiatePaymentParams): Promise<PaymentResponse> => {
      throw new Error("Online payment gateway is not configured in local mode.");
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast.error(error.message);
    },
  });
  return { initiatePayment: mutation.mutate, isProcessing: isProcessing || mutation.isPending, error: mutation.error };
}
