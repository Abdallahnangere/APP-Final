
import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../../types';
import { formatCurrency, generateReceiptData, cn } from '../../lib/utils';
import { Trash2, Download, Smartphone, Wifi, ArrowUpRight, Search, RefreshCw, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { toPng } from 'html-to-image';
import { SharedReceipt } from '../SharedReceipt';
import { BrandedReceipt } from '../BrandedReceipt';
import { toast } from '../../lib/toast';
import { api } from '../../lib/api';

interface HistoryProps {
    onBack?: () => void;
}

export const History: React.FC<HistoryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('');
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [detailedCheck, setDetailedCheck] = useState<{ tx_ref: string; payment: boolean; delivery: boolean; checking: boolean } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);

  useEffect(() => {
      loadHistory();
  }, []);

  const loadHistory = () => {
      try {
          const raw = localStorage.getItem('sauki_user_history');
          if (raw) setHistory(JSON.parse(raw));
      } catch(e) {}
  };

  const handleCheckPending = async (tx: Transaction) => {
      if (tx.status !== 'pending') return;
      setCheckingId(tx.tx_ref);
      setDetailedCheck({ tx_ref: tx.tx_ref, payment: false, delivery: false, checking: true });
      toast.info("Verifying transaction status...");
      
      try {
          const res = await api.verifyTransaction(tx.tx_ref);
          
          // Determine payment and delivery status
          const paymentConfirmed = res.status === 'paid' || res.status === 'delivered';
          const dataDelivered = res.status === 'delivered';
          
          setDetailedCheck({ 
            tx_ref: tx.tx_ref, 
            payment: paymentConfirmed, 
            delivery: dataDelivered, 
            checking: false 
          });
          
          // Update local storage with new status
          const raw = localStorage.getItem('sauki_user_history');
          if (raw) {
              const historyList: Transaction[] = JSON.parse(raw);
              const index = historyList.findIndex(h => h.tx_ref === tx.tx_ref);
              if (index !== -1) {
                  historyList[index] = { ...historyList[index], status: res.status };
                  localStorage.setItem('sauki_user_history', JSON.stringify(historyList));
                  setHistory(historyList);
              }
          }
          
          if (res.status === 'delivered') {
              if (tx.type === 'data') {
                  toast.success("✓ Data delivered! Check your balance.");
              } else {
                  toast.success("✓ Transaction Complete: Item Delivered!");
              }
          } else if (res.status === 'paid') {
              if (tx.type === 'data') {
                  toast.success("✓ Payment confirmed! Data is being sent...");
              } else {
                  toast.success("✓ Payment confirmed! Processing your order...");
              }
          } else if (res.status === 'pending') {
              toast.error("⏳ Still awaiting payment confirmation. Try again later.");
          } else if (res.status === 'failed') {
              toast.error("✗ Transaction failed. Contact support.");
          } else {
              toast.info("Status: " + res.status);
          }
          
          // Auto-hide detailed check after 5 seconds
          setTimeout(() => setDetailedCheck(null), 5000);
      } catch (e) {
          toast.error("Failed to check status. Verify your connection.");
          setDetailedCheck(null);
          console.error(e);
      } finally {
          setCheckingId(null);
      }
  };

  const clearHistory = () => {
      if(confirm("Permanently delete all local transaction records?")) {
          localStorage.removeItem('sauki_user_history');
          setHistory([]);
          toast.success("History Cleared");
      }
  };

  const handleReceipt = (tx: any) => {
      setReceiptTx(tx);
      setTimeout(async () => {
          if (receiptRef.current) {
              const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `RECEIPT-${tx.tx_ref}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("Receipt Saved");
              setReceiptTx(null);
          }
      }, 500);
  };

  const filteredHistory = history.filter(h => 
      h.tx_ref.toLowerCase().includes(filter.toLowerCase()) || 
      h.phone?.includes(filter)
  );

  return (
    <div className="h-screen bg-primary-50 flex flex-col overflow-hidden">
        {receiptTx && (
            <BrandedReceipt ref={receiptRef} transaction={generateReceiptData(receiptTx)} />
        )}

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-primary-100 px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-900">Activity</h1>
                    <p className="text-xs font-medium text-primary-500 mt-1 uppercase tracking-wide">Transaction History</p>
                </div>
                {history.length > 0 && (
                    <button 
                      onClick={clearHistory} 
                      className="w-11 h-11 bg-accent-red/10 text-accent-red rounded-xl flex items-center justify-center hover:bg-accent-red/20 transition-colors shadow-elevation-2"
                      title="Clear history"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            {/* Search Bar */}
            <div className="bg-primary-100/50 px-4 py-3 rounded-xl flex items-center gap-3 border border-primary-200/50">
                <Search className="w-5 h-5 text-primary-400" />
                <input 
                    className="flex-1 outline-none text-sm font-medium text-primary-900 bg-transparent placeholder:text-primary-400"
                    placeholder="Search by reference or phone..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>
        </div>

        {/* Transactions List - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
            {filteredHistory.length === 0 ? (
                <div className="text-center py-24 opacity-60">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-primary-400" />
                    </div>
                    <p className="font-semibold text-primary-600 uppercase text-xs tracking-wide">No Transactions Yet</p>
                    <p className="text-primary-400 text-xs mt-2">Your activity will appear here</p>
                </div>
            ) : (
                filteredHistory.map((tx, idx) => (
                    <div key={idx} className="relative">
                        <div className="bg-white rounded-2xl border border-primary-100/50 shadow-elevation-2 overflow-hidden hover:shadow-elevation-4 transition-shadow">
                            {/* Transaction Item */}
                            <div className="p-4 flex items-start gap-4">
                                {/* Icon */}
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold flex-center",
                                    tx.type === 'data' ? "bg-accent-blue/10 text-accent-blue" : 
                                    tx.type === 'wallet_funding' ? "bg-accent-green/10 text-accent-green" :
                                    "bg-accent-purple/10 text-accent-purple"
                                )}>
                                    {tx.type === 'data' ? <Wifi className="w-6 h-6" /> : 
                                     tx.type === 'wallet_funding' ? <ArrowUpRight className="w-6 h-6" /> : 
                                     <Smartphone className="w-6 h-6" />}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-primary-900 uppercase tracking-tight">
                                        {tx.type === 'data' ? 'Data Bundle' : tx.type === 'ecommerce' ? 'Store Purchase' : 'Wallet Funding'}
                                    </p>
                                    <p className="text-xs text-primary-500 font-medium mt-0.5">
                                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className={cn(
                                        "text-xs font-mono mt-1.5 truncate",
                                        tx.status === 'pending' ? "text-accent-orange font-semibold" :
                                        tx.status === 'failed' ? "text-accent-red font-semibold" :
                                        tx.status === 'paid' ? "text-accent-blue font-semibold" :
                                        "text-accent-green font-semibold"
                                    )}>
                                        {tx.tx_ref.slice(0, 20)}... • {tx.status.toUpperCase()}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-primary-900 text-lg">{formatCurrency(tx.amount)}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 pb-4 flex gap-2 border-t border-primary-100/50 pt-3">
                                {tx.status === 'pending' && (
                                    <button 
                                        onClick={() => handleCheckPending(tx)}
                                        disabled={checkingId === tx.tx_ref}
                                        className={cn(
                                            "flex-1 px-3 py-2 rounded-lg text-xs font-semibold uppercase flex items-center justify-center gap-1.5 transition-all",
                                            checkingId === tx.tx_ref 
                                              ? "bg-accent-orange/20 text-accent-orange" 
                                              : "bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20 shadow-elevation-2"
                                        )}
                                    >
                                        <RefreshCw className={cn("w-3.5 h-3.5", checkingId === tx.tx_ref && "animate-spin")} />
                                        Check Status
                                    </button>
                                )}
                                <button 
                                  onClick={() => handleReceipt(tx)} 
                                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold uppercase bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors shadow-elevation-2 flex items-center justify-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" /> Receipt
                                </button>
                            </div>
                        </div>

                        {/* Detailed Check Modal */}
                        {detailedCheck?.tx_ref === tx.tx_ref && detailedCheck && (
                            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center z-50 backdrop-blur-sm">
                                <div className="bg-white rounded-2xl p-5 mx-4 shadow-elevation-8">
                                    {detailedCheck.checking ? (
                                        <div className="flex flex-col items-center gap-3 py-6">
                                            <div className="w-12 h-12 border-3 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin"></div>
                                            <p className="text-sm font-semibold text-primary-900">Verifying...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 min-w-[280px]">
                                            <h3 className="font-bold text-primary-900 text-lg">Transaction Verification</h3>
                                            
                                            {/* Payment Status */}
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
                                                {detailedCheck.payment ? (
                                                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-accent-orange flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-xs font-semibold text-primary-600 uppercase">Payment Status</p>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        detailedCheck.payment ? "text-accent-green" : "text-accent-orange"
                                                    )}>
                                                        {detailedCheck.payment ? "✓ Confirmed" : "⏳ Pending"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Data Delivery Status (for data transactions) */}
                                            {tx.type === 'data' && (
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
                                                    {detailedCheck.delivery ? (
                                                        <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-accent-orange flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-semibold text-primary-600 uppercase">Data Delivery</p>
                                                        <p className={cn(
                                                            "text-sm font-bold",
                                                            detailedCheck.delivery ? "text-accent-green" : "text-accent-orange"
                                                        )}>
                                                            {detailedCheck.delivery ? "✓ Delivered" : "⏳ In Progress"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message */}
                                            <p className="text-xs text-primary-500 text-center py-2">
                                                {detailedCheck.payment && detailedCheck.delivery 
                                                  ? "All systems go! Your transaction is complete."
                                                  : detailedCheck.payment && !detailedCheck.delivery 
                                                  ? "Payment confirmed. Delivery in progress..."
                                                  : "Please wait while we verify..."}
                                            </p>

                                            <button 
                                              onClick={() => setDetailedCheck(null)}
                                              className="w-full bg-accent-blue text-white font-semibold py-2 rounded-xl transition-all active:scale-95"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
