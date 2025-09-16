import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AdminSetupProps {
  user: User;
  onRoleGranted: () => void;
}

export const AdminSetup = ({ user, onRoleGranted }: AdminSetupProps) => {
  const [isGranting, setIsGranting] = useState(false);
  const { toast } = useToast();

  const handleGrantAdminAccess = async () => {
    setIsGranting(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Admin Access Granted",
        description: "You now have full access to the payroll system.",
      });
      
      onRoleGranted();
    } catch (error: any) {
      console.error('Error granting admin access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="bg-warning/10 p-3 rounded-full w-fit mx-auto mb-4">
            <Shield className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-xl">Admin Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Access Control Active</p>
                <p className="text-muted-foreground">
                  Your payroll system is now secured with role-based access control. 
                  Only authorized users can view sensitive salary and wage data.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Employee data is now protected</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Unauthorized access blocked</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Role-based permissions active</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Since you're the system owner, click below to grant yourself admin access:
            </p>
            <Button 
              onClick={handleGrantAdminAccess}
              disabled={isGranting}
              className="w-full"
            >
              {isGranting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Granting Access...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Grant Me Admin Access
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Signed in as: {user.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};