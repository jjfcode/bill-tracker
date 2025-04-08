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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Repeat as RepeatIcon } from '@mui/icons-material';
import { Bill } from '../types/bill';
import { useBills } from '../context/BillsContext';
import AddBill from './AddBill';

const BillList: React.FC = () => {
  const { bills, deleteBill, getBillById, updateBill } = useBills();
  const [editingBill, setEditingBill] = useState<Bill | undefined>();

  const getStatusColor = (status: Bill['status']) => {
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
    const updatedBill = {
      ...bill,
      status: 'paid' as const,
      lastPaid: new Date(),
    };
    updateBill(bill.id, updatedBill);
  };

  return (
    <>
      {editingBill && (
        <AddBill
          billToEdit={editingBill}
          onCancelEdit={handleCancelEdit}
        />
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Paid</TableCell>
              <TableCell>Recurring</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.name}</TableCell>
                <TableCell>${bill.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{bill.category}</TableCell>
                <TableCell>
                  <Chip
                    label={bill.status}
                    color={getStatusColor(bill.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {bill.lastPaid ? new Date(bill.lastPaid).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  {bill.isRecurring && (
                    <Tooltip title={`Recurring ${bill.frequency}`}>
                      <RepeatIcon color="primary" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(bill.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => deleteBill(bill.id)}>
                    <DeleteIcon />
                  </IconButton>
                  {bill.status !== 'paid' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleMarkAsPaid(bill)}
                      sx={{ ml: 1 }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BillList; 