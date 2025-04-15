import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Link,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Repeat as RepeatIcon, Link as LinkIcon, Undo as UndoIcon } from '@mui/icons-material';
import { Bill } from '../types/bill';
import { useBills } from '../context/BillsContext';
import AddBill from './AddBill';

const BillList: React.FC = () => {
  const { bills, deleteBill, getBillById, updateBill, markBillAsPaid } = useBills();
  const [editingBill, setEditingBill] = useState<Bill | undefined>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleEdit = (billId: string) => {
    const bill = getBillById(billId);
    if (bill) {
      setEditingBill(bill);
    }
  };

  const handleCancelEdit = () => {
    setEditingBill(undefined);
  };

  const handleMarkAsPaid = (bill: Bill) => {
    const nextPaymentDate = getNextPaymentDate(bill);
    markBillAsPaid(bill.id, nextPaymentDate);
  };

  const handleUndoPayment = (bill: Bill) => {
    const nextPaymentDate = getNextPaymentDate(bill);
    const updatedPaymentHistory = bill.paymentHistory.filter(
      payment => {
        const paymentDate = new Date(payment.date);
        return !(
          paymentDate.getFullYear() === nextPaymentDate.getFullYear() &&
          paymentDate.getMonth() === nextPaymentDate.getMonth() &&
          paymentDate.getDate() === nextPaymentDate.getDate()
        );
      }
    );

    updateBill(bill.id, {
      ...bill,
      paymentHistory: updatedPaymentHistory
    });
  };

  const getNextPaymentDate = (bill: Bill): Date => {
    if (!bill.isRecurring) {
      return new Date(bill.dueDate);
    }

    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    let nextDate = new Date(dueDate);

    while (nextDate <= today) {
      if (bill.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (bill.frequency === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else if (bill.frequency === 'annually') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }

    return nextDate;
  };

  const getCurrentStatus = (bill: Bill) => {
    const nextPaymentDate = getNextPaymentDate(bill);
    const currentDate = new Date();
    
    const paymentRecord = bill.paymentHistory.find(
      payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getFullYear() === nextPaymentDate.getFullYear() &&
               paymentDate.getMonth() === nextPaymentDate.getMonth() &&
               paymentDate.getDate() === nextPaymentDate.getDate();
      }
    );

    if (paymentRecord) {
      return paymentRecord.status;
    }

    if (nextPaymentDate < currentDate) {
      return 'overdue';
    }
    return 'pending';
  };

  const getUpcomingRecurringBills = (): Bill[] => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  
    return bills.filter((bill) => {
      if (!bill.isRecurring || !bill.frequency) return false;
  
      const nextPaymentDate = getNextPaymentDate(bill);
      return nextPaymentDate > today && nextPaymentDate <= nextMonth;
    });
  };
  
  const upcomingRecurringBills = getUpcomingRecurringBills();

  return (
    <>
      {editingBill && (
        <AddBill
          billToEdit={editingBill}
          onCancelEdit={handleCancelEdit}
        />
      )}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h1" gutterBottom>
          Bill List
        </Typography>
      </Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          '& .MuiTableCell-root': {
            padding: isMobile ? 1 : 2,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Recurring</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => {
              const currentStatus = getCurrentStatus(bill);
              const nextPaymentDate = getNextPaymentDate(bill);
              return (
                <TableRow key={bill.id}>
                  <TableCell>{bill.name}</TableCell>
                  <TableCell>${bill.amount.toFixed(2)}</TableCell>
                  <TableCell>{nextPaymentDate.toLocaleDateString()}</TableCell>
                  <TableCell>{bill.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={currentStatus}
                      color={getStatusColor(currentStatus)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </TableCell>
                  <TableCell>
                    {bill.isRecurring && (
                      <Tooltip title={`Recurring ${bill.frequency}`}>
                        <RepeatIcon color="primary" fontSize={isMobile ? "small" : "medium"} />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    {bill.website && (
                      <Link href={bill.website} target="_blank" rel="noopener noreferrer">
                        <LinkIcon fontSize={isMobile ? "small" : "medium"} />
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1 }}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(bill.id)} size={isMobile ? "small" : "medium"}>
                          <EditIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => deleteBill(bill.id)} size={isMobile ? "small" : "medium"}>
                          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>
                      {currentStatus !== 'paid' ? (
                        <Tooltip title="Mark as Paid">
                          <IconButton onClick={() => handleMarkAsPaid(bill)} size={isMobile ? "small" : "medium"}>
                            <CheckIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Undo Payment">
                          <IconButton onClick={() => handleUndoPayment(bill)} size={isMobile ? "small" : "medium"}>
                            <UndoIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {upcomingRecurringBills.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Upcoming Recurring Payments (Next Month)
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Next Payment</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingRecurringBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.name}</TableCell>
                    <TableCell>${bill.amount.toFixed(2)}</TableCell>
                    <TableCell>{getNextPaymentDate(bill).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default BillList;