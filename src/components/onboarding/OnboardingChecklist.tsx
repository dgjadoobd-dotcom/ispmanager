import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  X,
  Rocket,
  Circle,
  Sparkles,
  Users,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useOnboardingProgress, type OnboardingStep } from "@/hooks/useOnboardingProgress";

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const {
    steps,
    completedCount,
    totalSteps,
    progressPercent,
    allRequiredDone,
    showOnboarding,
    showSuccess,
    dismiss,
  } = useOnboardingProgress();

  // Show success celebration
  if (showSuccess) {
    return <OnboardingSuccess onDismiss={dismiss} />;
  }

  if (!showOnboarding) return null;

  // Find the next incomplete step
  const nextStep = steps.find((s) => !s.completed);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.02] overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-primary/10 p-2.5">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">Get started in 15 minutes</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Complete these steps to start billing and collecting payments
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 rounded-md p-1.5 hover:bg-accent transition-colors"
            aria-label="Dismiss onboarding"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-5">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
            {completedCount}/{totalSteps}
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-1.5">
          {steps.map((step) => (
            <StepRow
              key={step.id}
              step={step}
              isNext={nextStep?.id === step.id}
              onNavigate={() => navigate(step.href)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Individual step row */
function StepRow({
  step,
  isNext,
  onNavigate,
}: {
  step: OnboardingStep;
  isNext: boolean;
  onNavigate: () => void;
}) {
  return (
    <button
      onClick={onNavigate}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-150 group",
        step.completed
          ? "opacity-70 hover:opacity-100"
          : isNext
            ? "bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/10"
            : "hover:bg-muted/50"
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "shrink-0 rounded-full h-7 w-7 flex items-center justify-center transition-colors",
          step.completed
            ? "bg-success/15 text-success"
            : isNext
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
        )}
      >
        {step.completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <Circle className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              step.completed && "line-through text-muted-foreground"
            )}
          >
            {step.title}
          </span>
          {step.optional && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              Optional
            </Badge>
          )}
        </div>
        {!step.completed && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {step.description}
          </p>
        )}
      </div>

      {/* CTA Arrow */}
      {!step.completed && (
        <div className="shrink-0 flex items-center gap-1.5">
          {isNext && (
            <span className="hidden sm:block text-xs font-medium text-primary">
              {step.cta}
            </span>
          )}
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform group-hover:translate-x-0.5",
              isNext ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
      )}
    </button>
  );
}

/** Success celebration shown when all required steps complete */
function OnboardingSuccess({ onDismiss }: { onDismiss: () => void }) {
  const navigate = useNavigate();

  return (
    <Card className="border-success/20 bg-gradient-to-br from-card to-success/[0.03] overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-success/10 p-2.5">
              <Sparkles className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                You're ready to manage billing and collections
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your ISP is set up. Here's what you can do next:
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-md p-1.5 hover:bg-accent transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <NextActionCard
            icon={Users}
            title="Add more customers"
            description="Import or add customers in bulk"
            onClick={() => navigate("/dashboard/customers")}
          />
          <NextActionCard
            icon={Zap}
            title="Explore automation"
            description="Auto-suspend, reminders, and more"
            onClick={() => navigate("/dashboard/settings")}
          />
          <NextActionCard
            icon={Settings}
            title="Invite staff"
            description="Give your team secure access"
            onClick={() => navigate("/dashboard/settings")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function NextActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:shadow-soft hover:border-border/80 group"
    >
      <div className="shrink-0 rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}
