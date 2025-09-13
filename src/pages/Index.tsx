import { useState, useMemo } from "react";
import { Worker, WorkerFormData } from "@/types/worker";
import { WorkerCard } from "@/components/WorkerCard";
import { WorkerForm } from "@/components/WorkerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, DollarSign, TrendingUp, Factory, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch workers from Supabase
  const { data: workers = [], isLoading, error } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database format to app format
      return data.map(worker => ({
        id: worker.id,
        name: worker.name,
        salary: Number(worker.salary),
        advance: Number(worker.advance),
        dues: Number(worker.dues),
        netWage: Number(worker.net_wage),
        createdAt: new Date(worker.created_at),
        updatedAt: new Date(worker.updated_at),
      })) as Worker[];
    },
  });

  const calculateNetWage = (salary: number, advance: number, dues: number) => {
    return salary - advance + dues;
  };

  // Add worker mutation
  const addWorkerMutation = useMutation({
    mutationFn: async (data: WorkerFormData) => {
      const netWage = calculateNetWage(data.salary, data.advance, data.dues);
      const { error } = await supabase
        .from('workers')
        .insert({
          name: data.name,
          salary: data.salary,
          advance: data.advance,
          dues: data.dues,
          net_wage: netWage,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: `${data.name} has been added to the workforce.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add worker. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding worker:', error);
    },
  });

  // Update worker mutation
  const updateWorkerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: WorkerFormData }) => {
      const netWage = calculateNetWage(data.salary, data.advance, data.dues);
      const { error } = await supabase
        .from('workers')
        .update({
          name: data.name,
          salary: data.salary,
          advance: data.advance,
          dues: data.dues,
          net_wage: netWage,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setEditingWorker(null);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: `${data.name}'s information has been updated.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update worker. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating worker:', error);
    },
  });

  // Delete worker mutation
  const deleteWorkerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      const worker = workers.find(w => w.id === id);
      toast({
        title: "Worker Removed",
        description: `${worker?.name} has been removed from the workforce.`,
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete worker. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting worker:', error);
    },
  });

  const handleAddWorker = (data: WorkerFormData) => {
    addWorkerMutation.mutate(data);
  };

  const handleEditWorker = (data: WorkerFormData) => {
    if (!editingWorker) return;
    updateWorkerMutation.mutate({ id: editingWorker.id, data });
  };

  const handleDeleteWorker = (id: string) => {
    deleteWorkerMutation.mutate(id);
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-6">
            <Factory className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-4">
              Failed to load worker data. Please check your connection and try again.
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['workers'] })}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            <div className="flex items-center gap-3">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Button 
                onClick={() => setIsFormOpen(true)} 
                className="gap-2"
                disabled={addWorkerMutation.isPending}
              >
                {addWorkerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Worker
              </Button>
            </div>
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

      <WorkerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWorker(null);
        }}
        onSubmit={editingWorker ? handleEditWorker : handleAddWorker}
        worker={editingWorker}
        isSubmitting={addWorkerMutation.isPending || updateWorkerMutation.isPending}
      />
    </div>
  );
};

export default Index;