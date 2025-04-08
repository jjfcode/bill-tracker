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
    status: 'pending',
    isRecurring: false,
    frequency: 'monthly',
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

    const bill: Bill = {
      id: billToEdit?.id || crypto.randomUUID(),
      name: newBill.name,
      amount: newBill.amount,
      dueDate: newBill.dueDate,
      category: newBill.category,
      status: newBill.status || 'pending',
      isRecurring: newBill.isRecurring || false,
      frequency: newBill.frequency,
      website: newBill.website || undefined,
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
      status: 'pending',
      isRecurring: false,
      frequency: 'monthly',
      website: '',
    });
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setNewBill({ ...newBill, dueDate: date.toDate() });
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
              label="Bill Name"
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
              value={newBill.amount || ''}
              onChange={handleAmountChange}
              inputProps={{ min: 0, step: 0.01 }}
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
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newBill.category}
                label="Category"
                onChange={(e) =>
                  setNewBill({ ...newBill, category: e.target.value })
                }
                required
              >
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="rent">Rent</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="subscription">Subscription</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="loan">Loan</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              value={newBill.website || ''}
              onChange={(e) =>
                setNewBill({ ...newBill, website: e.target.value })
              }
              placeholder="https://example.com"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={newBill.isRecurring || false}
                  onChange={(e) => setNewBill({ ...newBill, isRecurring: e.target.checked })}
                />
              }
              label="Recurring Bill"
            />
          </Grid>
          {newBill.isRecurring && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={newBill.frequency || 'monthly'}
                  label="Frequency"
                  onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value as Bill['frequency'] })}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {billToEdit && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                {billToEdit ? 'Update Bill' : 'Add Bill'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddBill; 