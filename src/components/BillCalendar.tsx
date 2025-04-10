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

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const isDueDay = bills.some((bill) => {
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

      if (isDueDay) {
        return 'due-date-highlight';
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
      {/* Basic CSS for highlighting - can be moved to a separate CSS file */}
      <style>
        {`
          .due-date-highlight {
            background-color: #ffeb3b; /* Yellow background for due dates */
            border-radius: 50%;
            font-weight: bold;
          }
          .react-calendar {
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          /* You might want to add more styles to match your app's theme */
        `}
      </style>
    </Box>
  );
};

export default BillCalendar; 