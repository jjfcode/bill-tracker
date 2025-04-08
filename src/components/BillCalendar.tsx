import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useBills } from '../context/BillsContext';
import { Box, Typography } from '@mui/material';

const BillCalendar: React.FC = () => {
  const { bills } = useBills();

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const isDueDay = bills.some((bill) => {
        const dueDate = new Date(bill.dueDate);
        return (
          date.getFullYear() === dueDate.getFullYear() &&
          date.getMonth() === dueDate.getMonth() &&
          date.getDate() === dueDate.getDate()
        );
      });
      if (isDueDay) {
        return 'due-date-highlight'; // We'll add CSS for this class later
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