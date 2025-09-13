export interface Worker {
  id: string;
  name: string;
  baseSalary: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyWage {
  id: string;
  workerId: string;
  month: number;
  year: number;
  advance: number;
  dues: number;
  netWage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerFormData {
  name: string;
  baseSalary: number;
}

export interface MonthlyWageFormData {
  advance: number;
  dues: number;
}