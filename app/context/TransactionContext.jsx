"use client";

import React, { createContext, useContext, useState } from 'react';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  // Data Master Default (Dummy)
  const [transactions, setTransactions] = useState([
    { id: 1, date: '12 Okt 2023', periode: 'Oktober 2023', desc: 'Kotak Amal Jumat', cat: 'Donasi', type: 'Pemasukan', amount: 1250000 },
    { id: 2, date: '10 Okt 2023', periode: 'Oktober 2023', desc: 'Tagihan Listrik PLN', cat: 'Operasional', type: 'Pengeluaran', amount: 850000 },
    { id: 3, date: '08 Okt 2023', periode: 'Oktober 2023', desc: 'Transfer Donatur (Hamba Allah)', cat: 'Zakat', type: 'Pemasukan', amount: 5000000 },
    { id: 4, date: '05 Okt 2023', periode: 'Oktober 2023', desc: 'Pembelian Alat Kebersihan', cat: 'Pemeliharaan', type: 'Pengeluaran', amount: 320000 },
    { id: 5, date: '01 Okt 2023', periode: 'Oktober 2023', desc: 'Infaq Kajian Rutin', cat: 'Donasi', type: 'Pemasukan', amount: 750000 },
    // Data tambahan agar target bulan Oktober tercapai (Sesuai desain)
    { id: 6, date: '15 Okt 2023', periode: 'Oktober 2023', desc: 'Zakat Mal Bapak Fulan', cat: 'Zakat', type: 'Pemasukan', amount: 5500000 },
    { id: 7, date: '20 Okt 2023', periode: 'Oktober 2023', desc: 'Honor Khatib & Imam', cat: 'Insentif', type: 'Pengeluaran', amount: 3030000 },
    // Data September
    { id: 8, date: '28 Sep 2023', periode: 'September 2023', desc: 'Infaq Pengajian Ibu-ibu', cat: 'Donasi', type: 'Pemasukan', amount: 9800000 },
    { id: 9, date: '25 Sep 2023', periode: 'September 2023', desc: 'Perbaikan Sound System', cat: 'Pemeliharaan', type: 'Pengeluaran', amount: 5100000 },
  ]);

  // Saldo awal fiktif sebelum data di atas
  const baseSaldo = 35950000; 

  const addTransaction = (trx) => {
    // Tambah transaksi baru ke urutan paling atas
    setTransactions((prev) => [{ id: Date.now(), ...trx }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter(t => t.id !== id));
  };

  const editTransaction = (id, newAmount) => {
    setTransactions((prev) => prev.map(t => t.id === id ? { ...t, amount: newAmount } : t));
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      baseSaldo, 
      addTransaction, 
      deleteTransaction, 
      editTransaction 
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);