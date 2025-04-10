import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '../types/bill';
import { encryptData, decryptData } from '../utils/encryption';

interface BillsContextType {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (id: string, bill: Bill) => void;
  deleteBill: (id: string) => void;
  getBillById: (id: string) => Bill | undefined;
  markBillAsPaid: (id: string, paymentDate: Date) => void;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

const migrateBill = (bill: any): Bill => {
  if (!bill.paymentHistory) {
    return {
      ...bill,
      dueDate: ensureDate(bill.dueDate),
      paymentHistory: [{
        date: ensureDate(bill.dueDate),
        status: bill.status || 'pending'
      }]
    };
  }

  return {
    ...bill,
    dueDate: ensureDate(bill.dueDate),
    paymentHistory: bill.paymentHistory.map((payment: any) => ({
      date: ensureDate(payment.date),
      status: payment.status
    }))
  };
};

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const savedBills = localStorage.getItem('bills');
      if (savedBills) {
        const decryptedBills = decryptData(savedBills);
        return decryptedBills.map(migrateBill);
      }
    } catch (error) {
      console.error('Error decrypting bills:', error);
      localStorage.removeItem('bills');
    }
    return [];
  });

  useEffect(() => {
    try {
      const encryptedBills = encryptData(bills);
      localStorage.setItem('bills', encryptedBills);
    } catch (error) {
      console.error('Error encrypting bills:', error);
    }
  }, [bills]);

  const addBill = (bill: Bill) => {
    const billWithHistory: Bill = {
      ...bill,
      dueDate: ensureDate(bill.dueDate),
      paymentHistory: [{
        date: ensureDate(bill.dueDate),
        status: 'pending' as const
      }]
    };
    setBills((prevBills) => [...prevBills, billWithHistory]);
  };

  const updateBill = (id: string, updatedBill: Bill) => {
    setBills((prevBills) =>
      prevBills.map((bill) => (bill.id === id ? updatedBill : bill))
    );
  };

  const deleteBill = (id: string) => {
    setBills((prevBills) => prevBills.filter((bill) => bill.id !== id));
  };

  const getBillById = (id: string) => {
    return bills.find((bill) => bill.id === id);
  };

  const markBillAsPaid = (id: string, paymentDate: Date) => {
    setBills((prevBills) =>
      prevBills.map((bill) => {
        if (bill.id === id) {
          const updatedHistory = [...bill.paymentHistory];
          const paymentIndex = updatedHistory.findIndex(
            (payment) => payment.date.getTime() === paymentDate.getTime()
          );

          if (paymentIndex !== -1) {
            updatedHistory[paymentIndex] = {
              ...updatedHistory[paymentIndex],
              status: 'paid' as const
            };
          } else {
            updatedHistory.push({
              date: paymentDate,
              status: 'paid' as const
            });
          }

          return {
            ...bill,
            paymentHistory: updatedHistory
          };
        }
        return bill;
      })
    );
  };

  return (
    <BillsContext.Provider
      value={{
        bills,
        addBill,
        updateBill,
        deleteBill,
        getBillById,
        markBillAsPaid
      }}
    >
      {children}
    </BillsContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillsContext);
  if (context === undefined) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
}; 