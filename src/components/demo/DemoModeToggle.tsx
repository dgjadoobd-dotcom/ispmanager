import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** 
 * Small toggle button for the header / settings.
 * Only visible to ISP Owner / Super Admin roles.
 */
export function DemoModeToggle() {
  const { isDemoMode, toggleDemo } = useDemoMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isDemoMode ? "default" : "outline"}
          size="sm"
          onClick={toggleDemo}
          className="gap-1.5 h-8"
        >
          {isDemoMode ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit Demo</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Demo Mode</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDemoMode
          ? "Exit demo mode and return to real data"
          : "Preview with sample data for sales demos"}
      </TooltipContent>
    </Tooltip>
  );
}
