import { useState, useEffect } from "react";
import { MonthlyWage, MonthlyWageFormData, Worker } from "@/types/worker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Loader2 } from "lucide-react";

interface MonthlyWageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MonthlyWageFormData) => void;
  worker: Worker;
  month: number;
  year: number;
  existingWage?: MonthlyWage | null;
  isSubmitting?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MonthlyWageForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  worker, 
  month, 
  year, 
  existingWage, 
  isSubmitting = false 
}: MonthlyWageFormProps) => {
  const [formData, setFormData] = useState<MonthlyWageFormData>({
    advance: 0,
    dues: 0,
  });

  useEffect(() => {
    if (existingWage) {
      setFormData({
        advance: existingWage.advance,
        dues: existingWage.dues,
      });
    } else {
      setFormData({
        advance: 0,
        dues: 0,
      });
    }
  }, [existingWage, isOpen]);

  const calculateNetWage = () => {
    return worker.baseSalary - formData.advance + formData.dues;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const netWage = calculateNetWage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingWage ? "Update" : "Set"} Wage for {worker.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {MONTHS[month - 1]} {year} • Base Salary: {formatCurrency(worker.baseSalary)}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="advance">Advance Taken (₹)</Label>
            <Input
              id="advance"
              type="number"
              min="0"
              step="0.01"
              value={formData.advance}
              onChange={(e) => setFormData({ ...formData, advance: parseFloat(e.target.value) || 0 })}
              placeholder="Enter advance amount"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dues">Additional Dues (₹)</Label>
            <Input
              id="dues"
              type="number"
              min="0"
              step="0.01"
              value={formData.dues}
              onChange={(e) => setFormData({ ...formData, dues: parseFloat(e.target.value) || 0 })}
              placeholder="Enter additional dues"
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Wage Calculation</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span>{formatCurrency(worker.baseSalary)}</span>
                </div>
                <div className="flex justify-between text-warning">
                  <span>Less: Advance:</span>
                  <span>-{formatCurrency(formData.advance)}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Add: Dues:</span>
                  <span>+{formatCurrency(formData.dues)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Net Wage:</span>
                  <span className={netWage >= 0 ? "text-success" : "text-warning"}>
                    {formatCurrency(netWage)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {existingWage ? "Updating..." : "Setting..."}
                </>
              ) : (
                existingWage ? "Update Wage" : "Set Wage"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};