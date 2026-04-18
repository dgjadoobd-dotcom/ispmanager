import { Eye, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useNavigate } from "react-router-dom";

export function DemoModeBanner() {
  const { isDemoMode, disableDemo } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleStartReal = () => {
    disableDemo();
    navigate("/dashboard");
  };

  return (
    <div className="bg-primary/10 text-foreground px-4 py-2 flex items-center justify-between border-b border-primary/20 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Eye className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-medium">
          Demo Mode
        </span>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          Sample Data
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartReal}
          className="h-7 gap-1 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        >
          Start using real data
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <button
          onClick={disableDemo}
          className="shrink-0 rounded-md p-1 hover:bg-primary/10 transition-colors"
          aria-label="Exit demo mode"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
