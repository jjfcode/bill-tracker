import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Bill } from '../types/bill';
import { useBills } from '../context/BillsContext';

interface AddBillProps {
  billToEdit?: Bill;
  onCancelEdit?: () => void;
}

const AddBill: React.FC<AddBillProps> = ({ billToEdit, onCancelEdit }) => {
  const { addBill, updateBill } = useBills();
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    name: '',
    amount: 0,
    dueDate: new Date(),
    category: '',
    isRecurring: false,
    frequency: 'monthly',
    paymentHistory: [{
      date: new Date(),
      status: 'pending' as const
    }]
  });

  useEffect(() => {
    if (billToEdit) {
      setNewBill(billToEdit);
    }
  }, [billToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !newBill.dueDate || !newBill.category) {
      return;
    }

    const dueDate = newBill.dueDate instanceof Date ? newBill.dueDate : new Date(newBill.dueDate);
    
    const bill: Bill = {
      id: billToEdit?.id || crypto.randomUUID(),
      name: newBill.name,
      amount: newBill.amount,
      dueDate: dueDate,
      category: newBill.category,
      isRecurring: newBill.isRecurring || false,
      frequency: newBill.frequency,
      website: newBill.website || undefined,
      paymentHistory: [{
        date: dueDate,
        status: 'pending' as const
      }]
    };

    if (billToEdit) {
      updateBill(bill.id, bill);
      onCancelEdit?.();
    } else {
      addBill(bill);
    }

    setNewBill({
      name: '',
      amount: 0,
      dueDate: new Date(),
      category: '',
      isRecurring: false,
      frequency: 'monthly',
      website: '',
      paymentHistory: [{
        date: new Date(),
        status: 'pending' as const
      }]
    });
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      const newDate = date.toDate();
      setNewBill({ 
        ...newBill, 
        dueDate: newDate,
        paymentHistory: [{
          date: newDate,
          status: 'pending' as const
        }]
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || !isNaN(Number(value))) {
      setNewBill({ ...newBill, amount: value === '' ? 0 : Number(value) });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {billToEdit ? 'Edit Bill' : 'Add New Bill'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={newBill.name}
              onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={newBill.amount}
              onChange={handleAmountChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={dayjs(newBill.dueDate)}
                onChange={handleDateChange}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              value={newBill.category}
              onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              value={newBill.website || ''}
              onChange={(e) => setNewBill({ ...newBill, website: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={newBill.isRecurring}
                  onChange={(e) => setNewBill({ ...newBill, isRecurring: e.target.checked })}
                />
              }
              label="Recurring"
            />
            {newBill.isRecurring && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={newBill.frequency}
                  label="Frequency"
                  onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value as 'monthly' | 'quarterly' | 'annually' })}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {billToEdit ? 'Update Bill' : 'Add Bill'}
              </Button>
              {billToEdit && (
                <Button variant="outlined" onClick={onCancelEdit}>
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddBill; 