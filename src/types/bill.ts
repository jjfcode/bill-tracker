export interface Bill {
  id: string;
  name: string;
  dueDate: Date;
  amount: number;
  category: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  notes?: string;
  lastPaid?: Date;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
} 