export interface Worker {
  id: string;
  name: string;
  salary: number;
  advance: number;
  dues: number;
  netWage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerFormData {
  name: string;
  salary: number;
  advance: number;
  dues: number;
}