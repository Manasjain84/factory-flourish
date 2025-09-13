import { Worker, MonthlyWage } from "@/types/worker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, DollarSign, Settings } from "lucide-react";

interface WorkerCardProps {
  worker: Worker;
  monthlyWage?: MonthlyWage | null;
  onEdit: (worker: Worker) => void;
  onDelete: (id: string) => void;
  onSetWage: (worker: Worker) => void;
}

export const WorkerCard = ({ worker, monthlyWage, onEdit, onDelete, onSetWage }: WorkerCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{worker.name}</h3>
              <p className="text-sm text-muted-foreground">
                Base: {formatCurrency(worker.baseSalary)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(worker)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(worker.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {monthlyWage ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Advance:</span>
              </div>
              <span className="font-medium text-warning">{formatCurrency(monthlyWage.advance)}</span>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-success" />
                <span className="text-muted-foreground">Dues:</span>
              </div>
              <span className="font-medium text-success">{formatCurrency(monthlyWage.dues)}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Wage:</span>
                <Badge 
                  variant={monthlyWage.netWage >= 0 ? "default" : "destructive"}
                  className="font-semibold"
                >
                  {formatCurrency(monthlyWage.netWage)}
                </Badge>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSetWage(worker)}
              className="w-full gap-2"
            >
              <Settings className="h-3 w-3" />
              Update This Month
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              No wage data for this month
            </p>
            <Button 
              onClick={() => onSetWage(worker)}
              className="gap-2"
              size="sm"
            >
              <Settings className="h-3 w-3" />
              Set Monthly Wage
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};