import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

const getCurrentYear = () => new Date().getFullYear();
const getYearRange = () => {
  const currentYear = getCurrentYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
};

export const MonthSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }: MonthSelectorProps) => {
  return (
    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
      <Calendar className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Viewing:</span>
      <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getYearRange().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};