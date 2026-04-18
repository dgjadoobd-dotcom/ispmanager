import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Password Reset Unavailable</CardTitle>
          <CardDescription>
            Password reset via email is not available in this mode. Please contact your administrator to update your password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/login" className="w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
