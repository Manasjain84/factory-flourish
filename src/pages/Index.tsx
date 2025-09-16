import { useState, useMemo, useEffect } from "react";
import { Worker, WorkerFormData, MonthlyWage, MonthlyWageFormData } from "@/types/worker";
import { WorkerCard } from "@/components/WorkerCard";
import { WorkerForm } from "@/components/WorkerForm";
import { MonthlyWageForm } from "@/components/MonthlyWageForm";
import { MonthSelector } from "@/components/MonthSelector";
import { AdminSetup } from "@/components/AdminSetup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, DollarSign, TrendingUp, Factory, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isWorkerFormOpen, setIsWorkerFormOpen] = useState(false);
  const [isWageFormOpen, setIsWageFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hasRole, setHasRole] = useState<boolean | null>(null);

  // Current month/year state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Authentication check
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to auth if not logged in
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Check user authorization
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      
      setHasRole(!!data);
      return data;
    },
    enabled: !!user,
  });

  // Fetch workers from Supabase
  const { data: workers = [], isLoading: workersLoading, error: workersError } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(worker => ({
        id: worker.id,
        name: worker.name,
        baseSalary: Number(worker.base_salary),
        createdAt: new Date(worker.created_at),
        updatedAt: new Date(worker.updated_at),
      })) as Worker[];
    },
    enabled: !!user && hasRole === true, // Only fetch when user is authenticated and authorized
  });

  // Fetch monthly wages for selected month/year
  const { data: monthlyWages = [], isLoading: wagesLoading } = useQuery({
    queryKey: ['monthly-wages', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_wages')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);
      
      if (error) throw error;
      
      return data.map(wage => ({
        id: wage.id,
        workerId: wage.worker_id,
        month: wage.month,
        year: wage.year,
        advance: Number(wage.advance),
        dues: Number(wage.dues),
        netWage: Number(wage.net_wage),
        createdAt: new Date(wage.created_at),
        updatedAt: new Date(wage.updated_at),
      })) as MonthlyWage[];
    },
    enabled: workers.length > 0 && !!user && hasRole === true,
  });

  const calculateNetWage = (baseSalary: number, advance: number, dues: number) => {
    return baseSalary - advance + dues;
  };

  // Add worker mutation
  const addWorkerMutation = useMutation({
    mutationFn: async (data: WorkerFormData) => {
      const { error } = await supabase
        .from('workers')
        .insert({
          name: data.name,
          base_salary: data.baseSalary,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setIsWorkerFormOpen(false);
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
      const { error } = await supabase
        .from('workers')
        .update({
          name: data.name,
          base_salary: data.baseSalary,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      setEditingWorker(null);
      setIsWorkerFormOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ['monthly-wages'] });
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

  // Set/Update monthly wage mutation
  const setMonthlyWageMutation = useMutation({
    mutationFn: async ({ workerId, data }: { workerId: string, data: MonthlyWageFormData }) => {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) throw new Error('Worker not found');
      
      const netWage = calculateNetWage(worker.baseSalary, data.advance, data.dues);
      
      const { error } = await supabase
        .from('monthly_wages')
        .upsert({
          worker_id: workerId,
          month: selectedMonth,
          year: selectedYear,
          advance: data.advance,
          dues: data.dues,
          net_wage: netWage,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-wages', selectedMonth, selectedYear] });
      setIsWageFormOpen(false);
      setSelectedWorker(null);
      toast({
        title: "Success",
        description: "Monthly wage has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update monthly wage. Please try again.",
        variant: "destructive",
      });
      console.error('Error setting monthly wage:', error);
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

  const handleSetWage = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsWageFormOpen(true);
  };

  const handleWageFormSubmit = (data: MonthlyWageFormData) => {
    if (!selectedWorker) return;
    setMonthlyWageMutation.mutate({ workerId: selectedWorker.id, data });
  };

  const openEditForm = (worker: Worker) => {
    setEditingWorker(worker);
    setIsWorkerFormOpen(true);
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workers, searchTerm]);

  // Get monthly wage for a specific worker
  const getWorkerMonthlyWage = (workerId: string) => {
    return monthlyWages.find(wage => wage.workerId === workerId);
  };

  const totalStats = useMemo(() => {
    const totalBaseSalary = workers.reduce((sum, w) => sum + w.baseSalary, 0);
    const totalAdvances = monthlyWages.reduce((sum, w) => sum + w.advance, 0);
    const totalDues = monthlyWages.reduce((sum, w) => sum + w.dues, 0);
    const totalNetWages = monthlyWages.reduce((sum, w) => sum + w.netWage, 0);
    
    return { totalBaseSalary, totalAdvances, totalDues, totalNetWages };
  }, [workers, monthlyWages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleRoleGranted = () => {
    setHasRole(true);
    queryClient.invalidateQueries({ queryKey: ['user-role'] });
  };

  const isLoading = workersLoading || wagesLoading || roleLoading;
  const error = workersError;

  // Show admin setup if user doesn't have a role
  if (user && hasRole === false) {
    return <AdminSetup user={user} onRoleGranted={handleRoleGranted} />;
  }

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

  const selectedWorkerWage = selectedWorker ? getWorkerMonthlyWage(selectedWorker.id) : null;

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
                <p className="text-sm text-muted-foreground">Manage monthly worker wages, advances & calculations</p>
                {user && <p className="text-xs text-muted-foreground">Signed in as: {user.email}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Button 
                onClick={() => setIsWorkerFormOpen(true)} 
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
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Month Selector */}
        <div className="mb-6">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>

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
              <p className="text-xs text-muted-foreground">
                {monthlyWages.length} have wage data this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Total Base Salaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalStats.totalBaseSalary)}</div>
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
                Net Payable This Month
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
                  ? "Start by adding your first factory worker to track their monthly wages."
                  : "Try adjusting your search terms to find workers."
                }
              </p>
              {workers.length === 0 && (
                <Button onClick={() => setIsWorkerFormOpen(true)} className="gap-2">
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
                monthlyWage={getWorkerMonthlyWage(worker.id)}
                onEdit={openEditForm}
                onDelete={handleDeleteWorker}
                onSetWage={handleSetWage}
              />
            ))}
          </div>
        )}
      </main>

      <WorkerForm
        isOpen={isWorkerFormOpen}
        onClose={() => {
          setIsWorkerFormOpen(false);
          setEditingWorker(null);
        }}
        onSubmit={editingWorker ? handleEditWorker : handleAddWorker}
        worker={editingWorker}
        isSubmitting={addWorkerMutation.isPending || updateWorkerMutation.isPending}
      />

      {selectedWorker && (
        <MonthlyWageForm
          isOpen={isWageFormOpen}
          onClose={() => {
            setIsWageFormOpen(false);
            setSelectedWorker(null);
          }}
          onSubmit={handleWageFormSubmit}
          worker={selectedWorker}
          month={selectedMonth}
          year={selectedYear}
          existingWage={selectedWorkerWage}
          isSubmitting={setMonthlyWageMutation.isPending}
        />
      )}
    </div>
  );
};

export default Index;