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
    daysWorked: 0,
    totalDaysInMonth: 30,
    overtimeHours: 0,
  });

  useEffect(() => {
    if (existingWage) {
      setFormData({
        advance: existingWage.advance,
        dues: existingWage.dues,
        daysWorked: existingWage.daysWorked,
        totalDaysInMonth: existingWage.totalDaysInMonth,
        overtimeHours: existingWage.overtimeHours,
      });
    } else {
      // Calculate total days in month
      const daysInMonth = new Date(year, month, 0).getDate();
      setFormData({
        advance: 0,
        dues: 0,
        daysWorked: daysInMonth,
        totalDaysInMonth: daysInMonth,
        overtimeHours: 0,
      });
    }
  }, [existingWage, isOpen, month, year]);

  const calculateNetWage = () => {
    // Calculate daily wage
    const dailyWage = worker.baseSalary / formData.totalDaysInMonth;
    
    // Calculate base wage for days worked
    const baseWageCalculated = dailyWage * formData.daysWorked;
    
    // Calculate overtime wage
    const overtimeWage = formData.overtimeHours * worker.overtimeRatePerHour;
    
    // Calculate net wage
    return baseWageCalculated - formData.advance + formData.dues + overtimeWage;
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
            {MONTHS[month - 1]} {year} • Base Salary: {formatCurrency(worker.baseSalary)} • {worker.shiftHours}hr shift
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daysWorked">Days Worked</Label>
              <Input
                id="daysWorked"
                type="number"
                min="0"
                max={formData.totalDaysInMonth}
                value={formData.daysWorked}
                onChange={(e) => setFormData({ ...formData, daysWorked: parseInt(e.target.value) || 0 })}
                placeholder="Days worked"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalDays">Total Days in Month</Label>
              <Input
                id="totalDays"
                type="number"
                min="28"
                max="31"
                value={formData.totalDaysInMonth}
                onChange={(e) => setFormData({ ...formData, totalDaysInMonth: parseInt(e.target.value) || 30 })}
                placeholder="Total working days"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtimeHours">Overtime Hours</Label>
            <Input
              id="overtimeHours"
              type="number"
              min="0"
              step="0.5"
              value={formData.overtimeHours}
              onChange={(e) => setFormData({ ...formData, overtimeHours: parseFloat(e.target.value) || 0 })}
              placeholder="Enter overtime hours"
            />
            <p className="text-xs text-muted-foreground">
              Rate: {formatCurrency(worker.overtimeRatePerHour)}/hour
            </p>
          </div>

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
                  <span>Monthly Salary:</span>
                  <span>{formatCurrency(worker.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Days Worked:</span>
                  <span>{formData.daysWorked} / {formData.totalDaysInMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Wage:</span>
                  <span>{formatCurrency((worker.baseSalary / formData.totalDaysInMonth) * formData.daysWorked)}</span>
                </div>
                {formData.overtimeHours > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Overtime ({formData.overtimeHours}hrs):</span>
                    <span>+{formatCurrency(formData.overtimeHours * worker.overtimeRatePerHour)}</span>
                  </div>
                )}
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