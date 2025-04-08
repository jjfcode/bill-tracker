import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '../types/bill';
import { encryptData, decryptData } from '../utils/encryption';

interface BillsContextType {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (id: string, bill: Bill) => void;
  deleteBill: (id: string) => void;
  getBillById: (id: string) => Bill | undefined;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const savedBills = localStorage.getItem('bills');
      if (savedBills) {
        return decryptData(savedBills);
      }
    } catch (error) {
      console.error('Error decrypting bills:', error);
      // Clear corrupted data
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
    setBills((prevBills) => [...prevBills, bill]);
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

  return (
    <BillsContext.Provider
      value={{
        bills,
        addBill,
        updateBill,
        deleteBill,
        getBillById,
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