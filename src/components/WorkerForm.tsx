import { useState, useEffect } from "react";
import { Worker, WorkerFormData } from "@/types/worker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Loader2 } from "lucide-react";

interface WorkerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkerFormData) => void;
  worker?: Worker | null;
  isSubmitting?: boolean;
}

export const WorkerForm = ({ isOpen, onClose, onSubmit, worker, isSubmitting = false }: WorkerFormProps) => {
  const [formData, setFormData] = useState<WorkerFormData>({
    name: "",
    salary: 0,
    advance: 0,
    dues: 0,
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        salary: worker.salary,
        advance: worker.advance,
        dues: worker.dues,
      });
    } else {
      setFormData({
        name: "",
        salary: 0,
        advance: 0,
        dues: 0,
      });
    }
  }, [worker, isOpen]);

  const calculateNetWage = () => {
    return formData.salary - formData.advance + formData.dues;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isSubmitting) {
      onClose();
    }
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
            {worker ? "Edit Worker" : "Add New Worker"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Worker Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter worker name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary">Base Salary (₹)</Label>
            <Input
              id="salary"
              type="number"
              min="0"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
              placeholder="Enter base salary"
              required
            />
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
                  <span>Base Salary:</span>
                  <span>{formatCurrency(formData.salary)}</span>
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
                  {worker ? "Updating..." : "Adding..."}
                </>
              ) : (
                worker ? "Update Worker" : "Add Worker"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};