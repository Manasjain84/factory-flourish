export interface Worker {
  id: string;
  name: string;
  baseSalary: number;
  shiftHours: number;
  overtimeRatePerHour: number;
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
  daysWorked: number;
  totalDaysInMonth: number;
  overtimeHours: number;
  baseWageCalculated: number;
  overtimeWage: number;
  netWage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerFormData {
  name: string;
  baseSalary: number;
  shiftHours: number;
  overtimeRatePerHour: number;
}

export interface MonthlyWageFormData {
  advance: number;
  dues: number;
  daysWorked: number;
  totalDaysInMonth: number;
  overtimeHours: number;
}