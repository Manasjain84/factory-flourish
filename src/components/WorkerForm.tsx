import { useState, useEffect } from "react";
import { Worker, WorkerFormData } from "@/types/worker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

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
    baseSalary: 0,
    shiftHours: 8,
    overtimeRatePerHour: 0,
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        baseSalary: worker.baseSalary,
        shiftHours: worker.shiftHours,
        overtimeRatePerHour: worker.overtimeRatePerHour,
      });
    } else {
      setFormData({
        name: "",
        baseSalary: 0,
        shiftHours: 8,
        overtimeRatePerHour: 0,
      });
    }
  }, [worker, isOpen]);

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
            <Label htmlFor="baseSalary">Base Salary (₹)</Label>
            <Input
              id="baseSalary"
              type="number"
              min="0"
              step="0.01"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
              placeholder="Enter base salary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Monthly base salary for full attendance
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftHours">Shift Hours</Label>
            <Input
              id="shiftHours"
              type="number"
              min="1"
              max="24"
              value={formData.shiftHours}
              onChange={(e) => setFormData({ ...formData, shiftHours: parseInt(e.target.value) || 8 })}
              placeholder="Enter daily shift hours"
              required
            />
            <p className="text-xs text-muted-foreground">
              Regular working hours per day (e.g., 8 for 8-hour shift)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtimeRate">Overtime Rate (₹/hour)</Label>
            <Input
              id="overtimeRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.overtimeRatePerHour}
              onChange={(e) => setFormData({ ...formData, overtimeRatePerHour: parseFloat(e.target.value) || 0 })}
              placeholder="Enter overtime rate per hour"
            />
            <p className="text-xs text-muted-foreground">
              Additional payment per overtime hour worked
            </p>
          </div>

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