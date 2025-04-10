import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill } from '../types/bill';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface BillsContextType {
  bills: Bill[];
  addBill: (bill: Bill) => Promise<void>;
  updateBill: (id: string, bill: Bill) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  getBillById: (id: string) => Bill | undefined;
  markBillAsPaid: (id: string, date: Date) => Promise<void>;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const useBills = () => {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
};

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setBills([]);
      return;
    }

    const billsRef = collection(db, 'bills');
    const q = query(
      billsRef,
      where('userId', '==', currentUser.uid),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billsData: Bill[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        billsData.push({
          ...data,
          id: doc.id,
          dueDate: data.dueDate.toDate(),
          paymentHistory: data.paymentHistory.map((payment: any) => ({
            ...payment,
            date: payment.date.toDate()
          }))
        } as Bill);
      });
      setBills(billsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addBill = async (bill: Bill) => {
    if (!currentUser) return;

    const billData = {
      ...bill,
      userId: currentUser.uid,
      dueDate: bill.dueDate,
      paymentHistory: bill.paymentHistory.map(payment => ({
        ...payment,
        date: payment.date
      }))
    };

    await addDoc(collection(db, 'bills'), billData);
  };

  const updateBill = async (id: string, bill: Bill) => {
    if (!currentUser) return;

    const billRef = doc(db, 'bills', id);
    const billData = {
      ...bill,
      userId: currentUser.uid,
      dueDate: bill.dueDate,
      paymentHistory: bill.paymentHistory.map(payment => ({
        ...payment,
        date: payment.date
      }))
    };

    await updateDoc(billRef, billData);
  };

  const deleteBill = async (id: string) => {
    if (!currentUser) return;

    const billRef = doc(db, 'bills', id);
    await deleteDoc(billRef);
  };

  const getBillById = (id: string) => {
    return bills.find(bill => bill.id === id);
  };

  const markBillAsPaid = async (id: string, date: Date) => {
    if (!currentUser) return;

    const bill = getBillById(id);
    if (!bill) return;

    const updatedBill = {
      ...bill,
      paymentHistory: [
        ...bill.paymentHistory,
        {
          date,
          status: 'paid' as const
        }
      ]
    };

    await updateBill(id, updatedBill);
  };

  const value = {
    bills,
    addBill,
    updateBill,
    deleteBill,
    getBillById,
    markBillAsPaid
  };

  return (
    <BillsContext.Provider value={value}>
      {children}
    </BillsContext.Provider>
  );
}; 