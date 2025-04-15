import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useBills } from '../context/BillsContext';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Bill } from '../types/bill';

const BillCalendar: React.FC = () => {
  const { bills } = useBills();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getRecurringDates = (bill: Bill, date: Date) => {
    if (!bill.isRecurring || !bill.frequency) return false;

    const dueDate = new Date(bill.dueDate);
    const currentDate = new Date(date);
    
    if (bill.frequency === 'monthly') {
      return dueDate.getDate() === currentDate.getDate();
    }
    
    if (bill.frequency === 'quarterly') {
      const monthDiff = (currentDate.getFullYear() * 12 + currentDate.getMonth()) - 
                       (dueDate.getFullYear() * 12 + dueDate.getMonth());
      return dueDate.getDate() === currentDate.getDate() && 
             monthDiff % 3 === 0;
    }
    
    if (bill.frequency === 'annually') {
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
    
    // Check if there's a payment record for this date
    const paymentRecord = bill.paymentHistory.find(
      payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getFullYear() === dueDate.getFullYear() &&
               paymentDate.getMonth() === dueDate.getMonth() &&
               paymentDate.getDate() === dueDate.getDate();
      }
    );

    if (paymentRecord) {
      return paymentRecord.status;
    }

    // If no payment record exists, determine status based on date
    if (dueDate < currentDate) {
      return 'overdue';
    } else {
      return 'pending';
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }): string | null => {
    if (view === 'month') {
      const billsOnDate = bills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        const isOriginalDueDate = 
          date.getFullYear() === dueDate.getFullYear() &&
          date.getMonth() === dueDate.getMonth() &&
          date.getDate() === dueDate.getDate();

        const isRecurringDate = getRecurringDates(bill, date);
        const isFutureDate = date >= new Date();

        // For recurring bills, show all future dates
        if (bill.isRecurring && isRecurringDate && isFutureDate) {
          return true;
        }

        // For non-recurring bills, show only the original date
        if (!bill.isRecurring && isOriginalDueDate) {
          return true;
        }

        // For past dates, show only if they match the original or recurring pattern
        if (!isFutureDate && (isOriginalDueDate || isRecurringDate)) {
          return true;
        }

        return false;
      });

      if (billsOnDate.length > 0) {
        const statuses = billsOnDate.map(bill => getBillStatus(bill, date));
        if (statuses.includes('overdue')) return 'overdue-date';
        if (statuses.includes('pending')) return 'pending-date';
        return 'paid-date';
      }
    }
    return null;
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Typography variant="h6" gutterBottom>
        Upcoming Payments
      </Typography>
      <Calendar 
        tileClassName={tileClassName}
        className="responsive-calendar"
        locale="en-US" // Start week on Sunday
      />
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
            width: 100%;
            max-width: 100%;
          }
          .responsive-calendar {
            font-size: ${isMobile ? '0.8rem' : '1rem'};
          }
          .responsive-calendar .react-calendar__tile {
            padding: ${isMobile ? '0.5em 0.2em' : '0.75em 0.5em'};
          }
          .responsive-calendar .react-calendar__navigation button {
            min-width: ${isMobile ? '30px' : '44px'};
            font-size: ${isMobile ? '0.8rem' : '1rem'};
          }
        `}
      </style>
    </Box>
  );
};

export default BillCalendar;