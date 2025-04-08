import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Bill } from '../types/bill';

interface BillsContextType {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (id: string, bill: Bill) => void;
  deleteBill: (id: string) => void;
  getBillById: (id: string) => Bill | undefined;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);

  const addBill = (bill: Bill) => {
    setBills([...bills, bill]);
  };

  const updateBill = (id: string, updatedBill: Bill) => {
    setBills(bills.map(bill => bill.id === id ? updatedBill : bill));
  };

  const deleteBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id));
  };

  const getBillById = (id: string) => {
    return bills.find(bill => bill.id === id);
  };

  return (
    <BillsContext.Provider value={{ bills, addBill, updateBill, deleteBill, getBillById }}>
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