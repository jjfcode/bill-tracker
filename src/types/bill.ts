export interface Bill {
  id: string;
  name: string;
  dueDate: Date;
  amount: number;
  category: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
  website?: string;
  paymentHistory: {
    date: Date;
    status: 'paid' | 'pending' | 'overdue';
  }[];
} 