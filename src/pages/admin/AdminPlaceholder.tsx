import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
}

export default function AdminPlaceholder({ title }: AdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Platform management and configuration
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>
            This section is under development
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Badge variant="secondary" className="mb-4">
            Coming Soon
          </Badge>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This feature is part of the Super Admin platform controls and will be available in an upcoming release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
