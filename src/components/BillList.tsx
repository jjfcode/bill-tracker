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
  Button,
  Tooltip,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Repeat as RepeatIcon, Link as LinkIcon, Undo as UndoIcon } from '@mui/icons-material';
import { Bill } from '../types/bill';
import { useBills } from '../context/BillsContext';
import AddBill from './AddBill';

const BillList: React.FC = () => {
  const { bills, deleteBill, getBillById, updateBill, markBillAsPaid } = useBills();
  const [editingBill, setEditingBill] = useState<Bill | undefined>();

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Next Payment</TableCell>
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
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {bill.isRecurring && (
                      <Tooltip title={`Recurring ${bill.frequency}`}>
                        <RepeatIcon color="primary" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    {bill.website && (
                      <Link href={bill.website} target="_blank" rel="noopener noreferrer">
                        <LinkIcon />
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(bill.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteBill(bill.id)}>
                      <DeleteIcon />
                    </IconButton>
                    {currentStatus !== 'paid' ? (
                      <Tooltip title="Mark as Paid">
                        <IconButton onClick={() => handleMarkAsPaid(bill)}>
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Undo Payment">
                        <IconButton onClick={() => handleUndoPayment(bill)}>
                          <UndoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BillList; 