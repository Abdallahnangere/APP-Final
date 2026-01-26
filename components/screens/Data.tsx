
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DataPlan, NetworkType, PaymentInitResponse, Agent } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, NETWORK_BG_COLORS, cn, saveToLocalHistory, generateReceiptData } from '../../lib/utils';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PINKeyboard } from '../ui/PINKeyboard';
import { CheckCircle2, Copy, Download, RefreshCw, Loader2, Wifi, Wallet, ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';
import { BrandedReceipt } from '../BrandedReceipt';
import { toast } from '../../lib/toast';

interface DataProps {
    agent?: Agent;
    onBack?: () => void;
}

export const Data: React.FC<DataProps> = ({ agent, onBack }) => {
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'plans' | 'confirm' | 'payment' | 'success' | 'agent_pin'>('plans');
  const [paymentDetails, setPaymentDetails] = useState<PaymentInitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [agentPin, setAgentPin] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [finalTx, setFinalTx] = useState<any>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
      try {
          const data = await api.getDataPlans();
          setPlans(data);
      } catch (e) {
          console.error("Failed to load plans");
      }
  };

  const handleSuccess = (tx: any) => {
      setStep('success');
      toast.success("Data Delivered!");
      
      const fullTx = {
         ...tx,
         createdAt: new Date().toISOString(),
         amount: selectedPlan?.price || 0,
         type: 'data',
         dataPlan: selectedPlan,
         tx_ref: paymentDetails?.tx_ref || tx.tx_ref,
         status: 'delivered'
      };

      if (!agent) {
          saveToLocalHistory(fullTx);
          setFinalTx(fullTx);
      } else {
          setFinalTx(tx);
      }
  };

  const filteredPlans = selectedNetwork 
    ? plans.filter(p => p.network === selectedNetwork)
    : [];

  const handleNetworkSelect = (net: NetworkType) => {
    setSelectedNetwork(net);
    setStep('plans');
  };

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
    setStep('confirm');
  };

  const handlePayClick = () => {
      if (!selectedPlan || phone.length < 10) return;
      if (agent) {
          setStep('agent_pin');
      } else {
          handleInitiatePayment();
      }
  }

  const handleAgentPurchase = async () => {
      if (!selectedPlan || !agent) return;
      if (agentPin.length !== 4) return toast.error("Enter valid 4-digit PIN");
      setIsLoading(true);
      try {
          const res = await api.agentWalletPurchase({
              agentId: agent.id,
              pin: agentPin,
              type: 'data',
              payload: {
                  planId: selectedPlan.id,
                  phone: phone
              }
          });
          setPaymentDetails({ 
              tx_ref: res.transaction.tx_ref,
              amount: res.transaction.amount,
              account_number: 'WALLET',
              account_name: 'WALLET',
              bank: 'WALLET'
          });
          handleSuccess(res.transaction);
      } catch (e: any) {
          toast.error(e.message || "Purchase failed");
      } finally {
          setIsLoading(false);
      }
  };

  const handleInitiatePayment = async () => {
    setIsLoading(true);
    try {
        const res = await api.initiateDataPayment({ planId: selectedPlan!.id, phone });
        setPaymentDetails(res);
        
        // IMMEDIATE SAVE TO HISTORY AS PENDING
        if(!agent) {
            saveToLocalHistory({
                id: 'temp-' + Date.now(),
                tx_ref: res.tx_ref,
                type: 'data',
                status: 'pending',
                phone: phone,
                amount: selectedPlan!.price,
                createdAt: new Date().toISOString(),
                dataPlan: selectedPlan || undefined
            } as any);
        }

        setStep('payment');
    } catch(e: any) {
        toast.error(e.message || "Connection error. Try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleManualCheck = async () => {
      if (!paymentDetails) return;
      setIsLoading(true);
      try {
          const res = await api.verifyTransaction(paymentDetails.tx_ref);
          if (res.status === 'delivered') {
              handleSuccess(res);
          } else if (res.status === 'paid') {
              toast.info("Payment confirmed. Delivery processing...");
          } else {
              toast.info("Payment not yet received. Please wait.");
          }
      } catch (e) {
          toast.error("Could not verify status.");
      } finally {
          setIsLoading(false);
      }
  };

  const downloadReceipt = async () => {
    if (receiptRef.current === null) return;
    try {
        const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `SAUKI-DATA-${paymentDetails?.tx_ref}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Receipt downloaded");
    } catch (err) {
        toast.error("Failed to generate receipt");
    }
  };

  const handleClose = () => {
      if (onBack) {
          onBack();
      } else {
        if (step === 'success') {
            setSelectedNetwork(null);
            setSelectedPlan(null);
            setPhone('');
        }
        setStep('plans');
        setPaymentDetails(null);
      }
  }

  const MotionButton = motion.button as any;
  const MotionDiv = motion.div as any;

  return (
    <div className="p-4 pb-6">
       {!selectedNetwork ? (
           <div className="space-y-4">
               <div>
                 <h2 className="text-lg font-black text-slate-900 mb-1">Select Network</h2>
                 <p className="text-xs text-slate-500 font-medium mb-4">Choose your preferred carrier</p>
               </div>
               <div className="space-y-2">
                 {['MTN', 'AIRTEL', 'GLO'].map((net) => (
                     <button
                         key={net}
                         onClick={() => handleNetworkSelect(net as NetworkType)}
                         className={cn("w-full h-20 rounded-2xl flex items-center px-4 font-bold text-lg shadow-sm transition-all border-2 active:scale-95 bg-white",
                          net === 'MTN' ? 'border-yellow-300 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200' : 
                          net === 'AIRTEL' ? 'border-red-300 hover:border-red-400 hover:shadow-lg hover:shadow-red-200' : 
                          'border-green-300 hover:border-green-400 hover:shadow-lg hover:shadow-green-200')}
                     >
                         <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mr-4 p-2 border border-slate-200">
                             <img src={`/${net.toLowerCase()}.png`} alt={net} className="w-full h-full object-contain" />
                         </div>
                         <div className="flex-1 text-left">
                           <div className="text-slate-900 font-black">{net}</div>
                           <div className="text-xs text-slate-500 font-semibold mt-0.5">Quick & Reliable</div>
                         </div>
                         <div className="text-xl">→</div>
                     </button>
                 ))}
               </div>
           </div>
       ) : (
           <div>
               <button onClick={() => setSelectedNetwork(null)} className="text-xs text-blue-600 mb-4 hover:text-blue-700 font-bold flex items-center gap-1 p-2 -ml-2">
                 <ArrowLeft className="w-4 h-4" /> Back to Networks
               </button>
               <div className="mb-4">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center p-2 border-2 border-slate-200">
                     <img src={`/${selectedNetwork.toLowerCase()}.png`} className="w-full h-full object-contain" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">{selectedNetwork}</h2>
                     <p className="text-xs text-slate-500 font-semibold">Select your plan below</p>
                   </div>
                 </div>
               </div>
               <div className="space-y-2">
                   {filteredPlans.map(plan => (
                       <button
                           key={plan.id}
                           onClick={() => handlePlanSelect(plan)}
                           className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-slate-300 hover:shadow-md hover:from-white transition-all active:scale-95"
                       >
                           <div className="text-left">
                               <div className="text-base font-black text-slate-900">{plan.data}</div>
                               <div className="text-xs text-slate-500 font-semibold mt-1">{plan.validity}</div>
                           </div>
                           <div className="text-lg font-black text-white bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-2 rounded-lg shadow-md">
                               {formatCurrency(plan.price)}
                           </div>
                       </button>
                   ))}
                   {filteredPlans.length === 0 && (
                     <div className="text-center py-8 text-slate-500">
                       <p className="text-sm font-semibold">No plans available for this network</p>
                     </div>
                   )}
               </div>
           </div>
       )}

       <BottomSheet isOpen={!!selectedPlan} onClose={handleClose} title="">
           {step === 'confirm' && selectedPlan && (
               <div className="space-y-4">
                   <div className="text-center pb-4 border-b border-slate-100">
                       <span className={cn("px-3 py-1 rounded text-xs font-bold mb-2 inline-block shadow-sm text-white", NETWORK_BG_COLORS[selectedPlan.network])}>
                           {selectedPlan.network}
                       </span>
                       <h3 className="text-4xl font-black text-slate-900 my-2">{selectedPlan.data}</h3>
                       <p className="text-slate-600 text-xs font-semibold">{selectedPlan.validity}</p>
                   </div>
                   
                   <div>
                       <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 block">Recipient Phone</label>
                       <Input 
                            placeholder="08012345678" 
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            className="h-11 text-base font-semibold rounded-lg border border-slate-200"
                       />
                   </div>
                   
                   <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                       <span className="text-slate-700 font-semibold text-sm">Total</span>
                       <span className="text-2xl font-black text-slate-900">{formatCurrency(selectedPlan.price)}</span>
                   </div>

                   <Button onClick={handlePayClick} isLoading={isLoading} className={cn("h-11 text-base font-bold rounded-lg uppercase tracking-wide text-white w-full", agent ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-900 hover:bg-slate-800")}>
                        {agent ? "Pay with Wallet" : "Continue"}
                   </Button>
               </div>
           )}

           {step === 'agent_pin' && agent && (
             <div className="space-y-4">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Wallet Debit</p>
                   <p className="text-3xl font-black text-blue-900">{selectedPlan && formatCurrency(selectedPlan.price)}</p>
                   <p className="text-xs text-blue-700 mt-2 font-semibold">from your available balance</p>
                 </div>
                 
                 <PINKeyboard 
                    value={agentPin}
                    onChange={setAgentPin}
                    onComplete={handleAgentPurchase}
                    isLoading={isLoading}
                 />
             </div>
           )}

           {step === 'payment' && paymentDetails && !agent && (
               <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 p-5 rounded-lg text-center">
                     <p className="text-xs text-orange-900 mb-2 font-bold uppercase tracking-wide">Transfer Exactly</p>
                     <p className="text-4xl font-black text-orange-900">{formatCurrency(paymentDetails.amount)}</p>
                     <p className="text-xs text-orange-700 mt-2 font-semibold">to the account below</p>
                 </div>
                 
                 <div className="space-y-2">
                     <div className="bg-white border border-slate-200 p-4 rounded-lg">
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Bank Name</p>
                         <p className="font-bold text-slate-900 text-base">{paymentDetails.bank}</p>
                     </div>
                     <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                         <div>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Account Number</p>
                             <p className="font-mono text-xl font-bold tracking-wider text-slate-900">{paymentDetails.account_number}</p>
                         </div>
                         <Button variant="ghost" className="w-10 h-10 p-0 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg" onClick={() => {
                             navigator.clipboard.writeText(paymentDetails.account_number);
                             toast.success("Copied!");
                         }}>
                             <Copy className="w-5 h-5" />
                         </Button>
                     </div>
                     <div className="bg-white border border-slate-200 p-4 rounded-lg">
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Account Name</p>
                         <p className="font-bold text-slate-900 text-sm">{paymentDetails.account_name}</p>
                     </div>
                 </div>

                 <div className="space-y-2 mt-4">
                    <Button onClick={handleManualCheck} isLoading={isLoading} className="bg-green-600 hover:bg-green-700 h-11 text-white font-bold shadow-lg rounded-lg uppercase tracking-wide w-full">
                        Confirm Payment Made
                    </Button>
                    
                    <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Manual verification required</p>
                    </div>
                 </div>
               </div>
           )}

           {step === 'success' && selectedPlan && paymentDetails && (
                <div className="text-center space-y-4 py-2">
                 
                 <BrandedReceipt 
                    ref={receiptRef}
                    transaction={generateReceiptData(finalTx || {
                        tx_ref: paymentDetails.tx_ref,
                        amount: selectedPlan.price,
                        createdAt: new Date().toISOString(),
                        type: 'data',
                        dataPlan: selectedPlan,
                        status: 'delivered',
                        phone: phone
                    }, agent)}
                 />

                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg border border-green-200">
                     <CheckCircle2 className="w-9 h-9 text-green-600" />
                 </div>
                 <div>
                     <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Data Delivered!</h2>
                     <p className="text-xs text-slate-600 mt-1">{selectedPlan.data} sent to {phone}.</p>
                 </div>
                 
                 <div className="flex flex-col gap-2 pt-2">
                     <Button 
                        onClick={downloadReceipt}
                        className="bg-slate-900 text-white h-11 font-bold rounded-lg uppercase tracking-wide"
                    >
                        <Download className="w-4 h-4 mr-2" /> Save Receipt
                     </Button>
                     <Button variant="ghost" onClick={handleClose} className="font-bold text-slate-400 text-xs uppercase tracking-wide">Close</Button>
                 </div>
             </div>
           )}
       </BottomSheet>
    </div>
  );
};
