import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }: { title?: string }) {
  const location = useLocation();
  const pageName = title || location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Page";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold capitalize text-foreground">{pageName}</h1>
      <p className="text-muted-foreground max-w-md">
        এই পেইজটি শীঘ্রই তৈরি করা হবে। আপনি পেইজ বাই পেইজ ডিজাইন আইডিয়া দিলে সেই অনুযায়ী তৈরি করা হবে।
      </p>
    </div>
  );
}
