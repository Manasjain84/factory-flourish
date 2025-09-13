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
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        baseSalary: worker.baseSalary,
      });
    } else {
      setFormData({
        name: "",
        baseSalary: 0,
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
              Base salary remains the same each month. Monthly advances and dues are set separately.
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