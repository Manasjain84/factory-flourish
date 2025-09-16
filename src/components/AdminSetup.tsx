import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";

export const AdminSetup = () => {
  const [isGranting, setIsGranting] = useState(false);
  const { toast } = useToast();

  const grantAdminAccess = async () => {
    setIsGranting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Admin access granted!",
        description: "You now have access to the payroll system. Please refresh the page.",
      });
      
      // Refresh the page to apply the new permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Failed to grant admin access",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <CardTitle>Admin Access Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          You need admin privileges to access the payroll system. Click below to grant yourself admin access.
        </p>
        <Button 
          onClick={grantAdminAccess}
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
              Grant Admin Access
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          This is a one-time setup. Future users will need to be granted access by an admin.
        </p>
      </CardContent>
    </Card>
  );
};