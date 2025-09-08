import { useState, useMemo } from "react";
import { Worker, WorkerFormData } from "@/types/worker";
import { WorkerCard } from "@/components/WorkerCard";
import { WorkerForm } from "@/components/WorkerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, DollarSign, TrendingUp, Factory } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const calculateNetWage = (salary: number, advance: number, dues: number) => {
    return salary - advance + dues;
  };

  const handleAddWorker = (data: WorkerFormData) => {
    const newWorker: Worker = {
      id: crypto.randomUUID(),
      ...data,
      netWage: calculateNetWage(data.salary, data.advance, data.dues),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setWorkers([...workers, newWorker]);
    toast({
      title: "Success",
      description: `${data.name} has been added to the workforce.`,
    });
  };

  const handleEditWorker = (data: WorkerFormData) => {
    if (!editingWorker) return;
    
    const updatedWorker: Worker = {
      ...editingWorker,
      ...data,
      netWage: calculateNetWage(data.salary, data.advance, data.dues),
      updatedAt: new Date(),
    };
    
    setWorkers(workers.map(w => w.id === editingWorker.id ? updatedWorker : w));
    setEditingWorker(null);
    toast({
      title: "Success",
      description: `${data.name}'s information has been updated.`,
    });
  };

  const handleDeleteWorker = (id: string) => {
    const worker = workers.find(w => w.id === id);
    setWorkers(workers.filter(w => w.id !== id));
    toast({
      title: "Worker Removed",
      description: `${worker?.name} has been removed from the workforce.`,
      variant: "destructive",
    });
  };

  const openEditForm = (worker: Worker) => {
    setEditingWorker(worker);
    setIsFormOpen(true);
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workers, searchTerm]);

  const totalStats = useMemo(() => {
    const totalSalary = workers.reduce((sum, w) => sum + w.salary, 0);
    const totalAdvances = workers.reduce((sum, w) => sum + w.advance, 0);
    const totalDues = workers.reduce((sum, w) => sum + w.dues, 0);
    const totalNetWages = workers.reduce((sum, w) => sum + w.netWage, 0);
    
    return { totalSalary, totalAdvances, totalDues, totalNetWages };
  }, [workers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Factory className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Factory Wage Manager</h1>
                <p className="text-sm text-muted-foreground">Manage worker salaries, advances & calculations</p>
              </div>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Worker
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total Salaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalStats.totalSalary)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                Total Advances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(totalStats.totalAdvances)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Net Payable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalStats.totalNetWages >= 0 ? 'text-success' : 'text-warning'}`}>
                {formatCurrency(totalStats.totalNetWages)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found
          </Badge>
        </div>

        {/* Workers Grid */}
        {filteredWorkers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {workers.length === 0 ? "No workers added yet" : "No workers match your search"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {workers.length === 0 
                  ? "Start by adding your first factory worker to track their wages and advances."
                  : "Try adjusting your search terms to find workers."
                }
              </p>
              {workers.length === 0 && (
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Worker
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onEdit={openEditForm}
                onDelete={handleDeleteWorker}
              />
            ))}
          </div>
        )}
      </main>

      {/* Worker Form Dialog */}
      <WorkerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWorker(null);
        }}
        onSubmit={editingWorker ? handleEditWorker : handleAddWorker}
        worker={editingWorker}
      />
    </div>
  );
};

export default Index;