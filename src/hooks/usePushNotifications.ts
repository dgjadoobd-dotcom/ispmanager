import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dbGet, dbInsert, TABLES } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePushNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSupported] = useState(() => "Notification" in window);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: customerData } = useQuery({
    queryKey: ["customerForPush", user?.id],
    queryFn: () => {
      if (!user?.id) return null;
      const customers = dbGet<any>(TABLES.customers);
      return customers.find((c: any) => c.user_id === user.id) ?? null;
    },
    enabled: !!user?.id,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!isSupported) throw new Error("Push notifications not supported");
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") throw new Error("Notification permission denied");
      setIsSubscribed(true);
      return null;
    },
    onSuccess: () => { toast.success("নোটিফিকেশন চালু হয়েছে"); },
    onError: (e: Error) => toast.error(e.message.includes("permission") ? "নোটিফিকেশন পারমিশন দেওয়া হয়নি" : "নোটিফিকেশন চালু করা যায়নি"),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => { setIsSubscribed(false); },
    onSuccess: () => toast.success("নোটিফিকেশন বন্ধ হয়েছে"),
  });

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["notificationHistory", customerData?.id],
    queryFn: () => {
      if (!customerData?.id) return [];
      return dbGet<any>(TABLES.notification_logs)
        .filter((l: any) => l.customer_id === customerData.id)
        .slice(0, 20);
    },
    enabled: !!customerData?.id,
  });

  return {
    isSupported, permission, isSubscribed,
    subscribe: subscribeMutation.mutate, unsubscribe: unsubscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending, isUnsubscribing: unsubscribeMutation.isPending,
    notifications, isLoadingNotifications,
  };
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (payload: { customer_id?: string; tenant_id: string; notification_type: string; title: string; body: string; data?: Record<string, unknown> }) => {
      dbInsert(TABLES.notification_logs, {
        tenant_id: payload.tenant_id, customer_id: payload.customer_id ?? null,
        notification_type: payload.notification_type, title: payload.title, body: payload.body,
        status: "sent", sent_at: new Date().toISOString(), error_message: null, data: payload.data ?? null,
      } as any);
      return { success: true };
    },
  });
}
