import { Worker } from "@/types/worker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface WorkerCardProps {
  worker: Worker;
  onEdit: (worker: Worker) => void;
  onDelete: (id: string) => void;
}

export const WorkerCard = ({ worker, onEdit, onDelete }: WorkerCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getNetWageColor = (netWage: number) => {
    if (netWage > 0) return "text-success";
    if (netWage < 0) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {worker.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(worker)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(worker.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Base Salary
            </div>
            <div className="font-semibold">{formatCurrency(worker.salary)}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Advance
            </div>
            <div className="font-semibold text-warning">{formatCurrency(worker.advance)}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Dues
            </div>
            <div className="font-semibold text-success">{formatCurrency(worker.dues)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Net Wage</div>
            <div className={`font-bold text-lg ${getNetWageColor(worker.netWage)}`}>
              {formatCurrency(worker.netWage)}
            </div>
          </div>
        </div>
        <div className="pt-2 border-t">
          <Badge variant={worker.netWage >= 0 ? "default" : "destructive"} className="text-xs">
            {worker.netWage >= 0 ? "Amount Due to Worker" : "Worker Owes Company"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};