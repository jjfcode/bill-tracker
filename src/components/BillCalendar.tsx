import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useBills } from '../context/BillsContext';
import { Box, Typography } from '@mui/material';
import { Bill } from '../types/bill';

const BillCalendar: React.FC = () => {
  const { bills } = useBills();

  const getRecurringDates = (bill: Bill, date: Date) => {
    if (!bill.isRecurring || !bill.frequency) return false;

    const dueDate = new Date(bill.dueDate);
    const currentDate = new Date(date);
    
    // If the bill is monthly recurring
    if (bill.frequency === 'monthly') {
      // Check if it's the same day of the month
      return dueDate.getDate() === currentDate.getDate();
    }
    
    // If the bill is quarterly recurring
    if (bill.frequency === 'quarterly') {
      // Check if it's the same day and every 3 months
      const monthDiff = (currentDate.getFullYear() * 12 + currentDate.getMonth()) - 
                       (dueDate.getFullYear() * 12 + dueDate.getMonth());
      return dueDate.getDate() === currentDate.getDate() && 
             monthDiff % 3 === 0;
    }
    
    // If the bill is yearly recurring
    if (bill.frequency === 'annually') {
      // Check if it's the same day and month
      return (
        dueDate.getDate() === currentDate.getDate() &&
        dueDate.getMonth() === currentDate.getMonth()
      );
    }

    return false;
  };

  const getBillStatus = (bill: Bill, date: Date) => {
    const currentDate = new Date();
    const dueDate = new Date(date);
    
    if (bill.status === 'paid') {
      return 'paid';
    } else if (dueDate < currentDate) {
      return 'overdue';
    } else {
      return 'pending';
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }): string | null => {
    if (view === 'month') {
      const billsOnDate = bills.filter((bill) => {
        // Check if it's the original due date
        const dueDate = new Date(bill.dueDate);
        const isOriginalDueDate = 
          date.getFullYear() === dueDate.getFullYear() &&
          date.getMonth() === dueDate.getMonth() &&
          date.getDate() === dueDate.getDate();

        // Check if it's a recurring date
        const isRecurringDate = getRecurringDates(bill, date);

        return isOriginalDueDate || isRecurringDate;
      });

      if (billsOnDate.length > 0) {
        // If there are multiple bills, prioritize the status in this order: overdue > pending > paid
        const statuses = billsOnDate.map(bill => getBillStatus(bill, date));
        if (statuses.includes('overdue')) return 'overdue-date';
        if (statuses.includes('pending')) return 'pending-date';
        return 'paid-date';
      }
    }
    return null;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upcoming Payments
      </Typography>
      <Calendar tileClassName={tileClassName} />
      <style>
        {`
          .paid-date {
            background-color: #4caf50;
            border-radius: 50%;
            font-weight: bold;
            color: white;
          }
          .overdue-date {
            background-color: #f44336;
            border-radius: 50%;
            font-weight: bold;
            color: white;
          }
          .pending-date {
            background-color: #ff9800;
            border-radius: 50%;
            font-weight: bold;
            color: white;
          }
          .react-calendar {
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
        `}
      </style>
    </Box>
  );
};

export default BillCalendar; 