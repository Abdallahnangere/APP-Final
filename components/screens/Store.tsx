
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Product, PaymentInitResponse, Agent } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, cn, saveToLocalHistory, generateReceiptData } from '../../lib/utils';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader2, CheckCircle2, Copy, Download, RefreshCw, ShoppingBag, Plus, Smartphone, ShieldCheck, Truck, Zap, Wallet } from 'lucide-react';
import { toPng } from 'html-to-image';
import { SharedReceipt } from '../SharedReceipt';
import { toast } from '../../lib/toast';

interface StoreProps {
    agent?: Agent;
    onBack?: () => void;
}

export const Store: React.FC<StoreProps> = ({ agent, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'device' | 'sim' | 'package'>('device');
  
  const [step, setStep] = useState<'details' | 'form' | 'payment' | 'success' | 'agent_pin'>('details');
  const [formData, setFormData] = useState({ name: '', phone: '', state: '' });
  const [selectedSimId, setSelectedSimId] = useState<string>(''); 
  const [agentPin, setAgentPin] = useState('');
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentInitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);
  const [finalTx, setFinalTx] = useState<any>(null);

  useEffect(() => {
      loadProducts();
  }, []);

  const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (e) {
          console.error("Failed to load products");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    let interval: any;
    if (paymentDetails && step === 'payment') {
      setIsPolling(true);
      interval = setInterval(async () => {
        try {
          const res = await api.verifyTransaction(paymentDetails.tx_ref);
          
          // UPDATE LOCAL STORAGE WITH STATUS
          if (!agent) {
              const currentTx = {
                  tx_ref: paymentDetails.tx_ref,
                  amount: paymentDetails.amount,
                  createdAt: new Date().toISOString(),
                  type: 'ecommerce' as any,
                  status: res.status,
                  product: selectedProduct || undefined,
                  customerName: formData.name,
                  phone: formData.phone,
                  deliveryData: { manifest: selectedProduct?.name }
              };
              saveToLocalHistory(currentTx as any);
          }

          if (res.status === 'paid' || res.status === 'delivered') {
            handleSuccess(res);
            setIsPolling(false);
            clearInterval(interval);
          }
        } catch (e) { }
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [paymentDetails, step]);

  const handleSuccess = (tx: any) => {
      setStep('success');
      toast.success("Payment confirmed!");
      
      const fullTx = {
          ...tx,
          createdAt: new Date().toISOString(),
          amount: tx.amount || paymentDetails?.amount || 0,
          type: 'ecommerce',
          product: selectedProduct,
          customerName: formData.name,
          phone: formData.phone,
          tx_ref: paymentDetails?.tx_ref || tx.tx_ref,
          deliveryData: { manifest: selectedProduct?.name }
      };
      
      if (!agent) {
          saveToLocalHistory(fullTx);
          setFinalTx(fullTx);
      } else {
          setFinalTx(tx);
      }
  };

  const handleBuyNow = () => {
    if (formData.name && formData.phone && formData.state) {
        if (agent) {
            setStep('agent_pin');
        } else {
            handleFormSubmit();
        }
    } else {
        setStep('form');
    }
  };

  const handleAgentPurchase = async () => {
      if (!selectedProduct || !agent) return;
      if (agentPin.length !== 4) return toast.error("Enter valid 4-digit PIN");
      setIsLoading(true);
      try {
          const res = await api.agentWalletPurchase({
              agentId: agent.id,
              pin: agentPin,
              type: 'ecommerce',
              payload: {
                  productId: selectedProduct.id,
                  simId: selectedSimId || undefined,
                  name: formData.name,
                  phone: formData.phone,
                  state: formData.state
              }
          });
          setPaymentDetails({ // Mocking PaymentDetails for receipt generation compatibility
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

  const handleFormSubmit = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
    try {
      const res = await api.initiateEcommercePayment({
        productId: selectedProduct.id,
        simId: selectedSimId || undefined, 
        ...formData
      });
      setPaymentDetails(res);
      
      // IMMEDIATE SAVE PENDING
      if(!agent) {
          saveToLocalHistory({
              id: 'temp-' + Date.now(),
              tx_ref: res.tx_ref,
              type: 'ecommerce',
              status: 'pending',
              amount: res.amount,
              createdAt: new Date().toISOString(),
              product: selectedProduct,
              customerName: formData.name,
              phone: formData.phone,
              deliveryData: { manifest: selectedProduct.name }
          } as any);
      }

      setStep('payment');
    } catch (e: any) {
      toast.error(e.message || "Error creating order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCheck = async () => {
      if (!paymentDetails) return;
      setIsLoading(true);
      try {
          const res = await api.verifyTransaction(paymentDetails.tx_ref);
          if (res.status === 'paid' || res.status === 'delivered') {
              handleSuccess(res);
          } else {
              toast.info("Payment not received yet.");
          }
      } catch (e) {
          toast.error("Verification failed.");
      } finally {
          setIsLoading(false);
      }
  };

  const downloadReceipt = async () => {
    if (receiptRef.current === null) return;
    try {
        const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `SAUKI-STORE-${paymentDetails?.tx_ref}.png`;
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
        setSelectedProduct(null);
        setStep('details');
        setPaymentDetails(null);
        setFormData({ name: '', phone: '', state: '' });
        setSelectedSimId('');
    }
  };

  const displayedProducts = products.filter(p => (p.category || 'device') === activeTab);
  const availableSims = products.filter(p => (p.category === 'sim'));
  const upsellSim = availableSims.find(s => s.id === selectedSimId);
  const currentTotal = selectedProduct ? (selectedProduct.price + (upsellSim ? upsellSim.price : 0)) : 0;

  const MotionDiv = motion.div as any;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col overflow-hidden">
      {receiptTx && (
          <SharedReceipt ref={receiptRef} transaction={generateReceiptData(finalTx || {})} />
      )}

      {/* Header */}
      <div className="px-6 pt-safe pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 shrink-0 flex items-center gap-4">
        {onBack && <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase transition-colors">← Back</button>}
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", agent ? "bg-purple-600 text-white" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white")}>
                  <ShoppingBag className="w-5 h-5" />
              </div>
              {agent ? 'Agent Store' : 'Premium Store'}
          </h1>
        </div>
      </div>

      {!selectedProduct ? (
        <>
          {/* Category Tabs */}
          <div className="px-6 pt-6 shrink-0 pb-2">
            <div className="flex p-2 bg-slate-100 rounded-[1.5rem] overflow-x-auto no-scrollbar gap-1">
                <button 
                  onClick={() => setActiveTab('device')}
                  className={cn("flex-1 min-w-[120px] whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'device' ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-700")}
                >
                  Devices
                </button>
                <button 
                  onClick={() => setActiveTab('sim')}
                  className={cn("flex-1 min-w-[120px] whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'sim' ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-700")}
                >
                  Data SIMs
                </button>
                <button 
                  onClick={() => setActiveTab('package')}
                  className={cn("flex-1 min-w-[140px] whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'package' ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-700")}
                >
                  Full Package
                </button>
            </div>
          </div>

          {/* Products Grid - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 pb-32">
            {isLoading && products.length === 0 ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-slate-300" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                  {displayedProducts.length === 0 ? (
                      <div className="col-span-2 text-center text-slate-400 py-12 font-black uppercase tracking-widest text-xs">No Inventory Available</div>
                  ) : displayedProducts.map((product) => (
                  <MotionDiv
                      key={product.id}
                      whileTap={{ scale: 0.94 }}
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden"
                      onClick={() => setSelectedProduct(product)}
                  >
                      <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center p-4 border border-slate-100 group-hover:border-slate-200">
                          <img src={product.image} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-black text-slate-900 text-xs line-clamp-2 min-h-[32px] leading-tight mb-3 uppercase tracking-tight">{product.name}</h3>
                        <div className="mt-auto">
                           <div className="font-black text-blue-600 text-lg tracking-tighter">{formatCurrency(product.price)}</div>
                           <p className="text-[10px] text-slate-400 font-semibold mt-1">Instant Delivery</p>
                        </div>
                      </div>
                  </MotionDiv>
                  ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* PRODUCT DETAIL VIEW */
        <BottomSheet isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setStep('details'); }} title={step === 'payment' ? 'Order Fulfillment' : step === 'success' ? 'Order Confirmed!' : 'Product Showcase'}>
           {step === 'details' && selectedProduct && (
               <div className="space-y-6">
                   {/* Product Image */}
                   <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8 border border-slate-100 shadow-inner">
                       <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl" />
                   </div>
                   
                   <div className="space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(selectedProduct.price)}</h2>
                              <p className="text-lg font-black text-slate-900 mt-2 uppercase leading-none tracking-tight max-w-xs">{selectedProduct.name}</p>
                          </div>
                          <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-green-100 flex items-center gap-1 shadow-sm shrink-0">
                              <Zap className="w-3 h-3 fill-green-600" /> In Stock
                          </div>
                       </div>

                       {/* Features Grid */}
                       <div className="grid grid-cols-3 gap-3">
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                              <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" />
                              <span className="text-[10px] font-black uppercase text-blue-700 tracking-widest">Premium<br/>Quality</span>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-50 to-green-50/50 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                              <Truck className="w-5 h-5 text-green-600 mb-2" />
                              <span className="text-[10px] font-black uppercase text-green-700 tracking-widest">NATIONWIDE<br/>SHIPPING</span>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl border border-purple-100 flex flex-col items-center text-center">
                              <Zap className="w-5 h-5 text-purple-600 mb-2" />
                              <span className="text-[10px] font-black uppercase text-purple-700 tracking-widest">INSTANT<br/>DISPATCH</span>
                          </div>
                       </div>

                       {/* Description */}
                       <div className="bg-gradient-to-br from-slate-50 to-slate-50/50 p-5 rounded-[2rem] border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3">Product Description</h4>
                          <p className="text-slate-700 text-sm font-medium leading-relaxed">
                              {selectedProduct.description || "Premium quality product from Sauki Mart. Fully inspected, instantly dispatched nationwide. Get authentic products with guaranteed delivery within your preferred timeframe."}
                          </p>
                       </div>

                       {/* SIM Upsell */}
                       {(selectedProduct.category === 'device' || selectedProduct.category === 'package') && availableSims.length > 0 && (
                           <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-2xl shadow-slate-300 border border-slate-700">
                               <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 block flex items-center gap-2">
                                   <Plus className="w-4 h-4 text-blue-400" /> Bundle with SIM?
                               </label>
                               <select 
                                  className="w-full p-4 rounded-2xl border-none bg-white/10 text-white font-black text-sm backdrop-blur-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none placeholder-white/50"
                                  value={selectedSimId}
                                  onChange={(e) => setSelectedSimId(e.target.value)}
                                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em', paddingRight: '3rem' }}
                               >
                                   <option value="" className="text-slate-900">None - Just the Device</option>
                                   {availableSims.map(sim => (
                                       <option key={sim.id} value={sim.id} className="text-slate-900">
                                           {sim.name} — +{formatCurrency(sim.price)}
                                       </option>
                                   ))}
                               </select>
                               {upsellSim && (
                                 <p className="text-xs text-blue-300 font-semibold mt-3 flex items-center gap-2">
                                   <CheckCircle2 className="w-4 h-4" /> Bundle total: {formatCurrency(currentTotal)}
                                 </p>
                               )}
                           </div>
                       )}
                   </div>

                   <Button onClick={handleBuyNow} className={cn("h-16 text-lg font-black text-white shadow-2xl shadow-slate-300 rounded-[2rem] uppercase tracking-tighter w-full", agent ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-purple-200" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-200")}>
                       {agent ? "Proceed to Wallet Pay" : "Confirm & Purchase"} {upsellSim && `(${formatCurrency(currentTotal)})`}
                   </Button>
               </div>
           )}

         {step === 'form' && selectedProduct && (
             <div className="space-y-6">
                 {/* Order Summary */}
                 <div className="bg-gradient-to-br from-slate-50 to-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-inner">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 border border-slate-100">
                      <img src={selectedProduct.image} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Order Summary</p>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">{selectedProduct.name} {upsellSim && `+ ${upsellSim.name}`}</p>
                        <p className="text-lg font-black text-blue-600 mt-2">{formatCurrency(currentTotal)}</p>
                    </div>
                 </div>

                 {/* Form Fields */}
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">Full Name</label>
                     <Input placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl h-14 font-semibold text-sm bg-white border border-slate-200" />
                   </div>
                   <div>
                     <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">Contact Phone</label>
                     <Input type="tel" placeholder="0801234567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-2xl h-14 font-semibold text-sm bg-white border border-slate-200" />
                   </div>
                   <div>
                     <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">Delivery Address</label>
                     <Input placeholder="Apartment, Street, City, State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="rounded-2xl h-14 font-semibold text-sm bg-white border border-slate-200" />
                   </div>
                 </div>
                 
                 <Button onClick={handleBuyNow} isLoading={isLoading} className={cn("h-16 text-lg font-black rounded-[2rem] uppercase tracking-tighter shadow-xl w-full text-white", agent ? "bg-gradient-to-r from-purple-600 to-purple-700" : "bg-gradient-to-r from-blue-600 to-blue-700")}>
                     {agent ? "Authorize Charge" : "Initialize Payment"} ({formatCurrency(currentTotal)})
                 </Button>
             </div>
         )}

         {step === 'agent_pin' && agent && (
             <div className="space-y-6 text-center">
                 <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-4">
                     <Wallet className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 uppercase">Authorize Transaction</h3>
                 <p className="text-slate-500 text-xs">Enter your 4-digit PIN to debit <strong>{formatCurrency(currentTotal)}</strong> from your wallet.</p>
                 
                 <Input 
                    type="password" 
                    maxLength={4} 
                    className="text-center text-3xl tracking-[1em] font-black h-20 rounded-3xl" 
                    value={agentPin}
                    onChange={e => setAgentPin(e.target.value)}
                 />
                 
                 <Button onClick={handleAgentPurchase} isLoading={isLoading} className="h-16 bg-slate-900 text-white rounded-[2rem] uppercase font-black tracking-widest shadow-xl">
                     Confirm Purchase
                 </Button>
             </div>
         )}

         {step === 'payment' && paymentDetails && !agent && (
             <div className="space-y-6">
                 {/* ... Payment UI same as previous ... */}
                 <div className="bg-orange-50 border-2 border-orange-100 p-8 rounded-[2.5rem] text-center relative overflow-hidden shadow-inner">
                     {isPolling && <MotionDiv animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-4 right-4 text-[9px] text-orange-600 font-black uppercase tracking-widest flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Verifying</MotionDiv>}
                     <p className="text-[10px] text-orange-800 mb-2 font-black uppercase tracking-widest">Transfer EXACTLY</p>
                     <p className="text-5xl font-black text-orange-900 tracking-tighter">{formatCurrency(paymentDetails.amount)}</p>
                     <p className="text-[10px] text-orange-600 mt-3 font-bold uppercase tracking-wider">Gateway Secure Provisioning</p>
                 </div>
                 
                 <div className="space-y-3">
                     <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Bank Name</p>
                         <p className="font-black text-slate-900 text-xl tracking-tight uppercase">{paymentDetails.bank}</p>
                     </div>
                     <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                         <div>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Account Number</p>
                             <p className="font-black text-3xl tracking-tight text-slate-900 font-mono">{paymentDetails.account_number}</p>
                         </div>
                         <Button variant="ghost" className="w-14 h-14 p-0 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full shadow-inner" onClick={() => {
                             navigator.clipboard.writeText(paymentDetails.account_number);
                             toast.success("Account number copied");
                         }}>
                             <Copy className="w-6 h-6" />
                         </Button>
                     </div>
                     <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Beneficiary Name</p>
                         <p className="font-black text-slate-900 text-base uppercase">{paymentDetails.account_name}</p>
                     </div>
                 </div>

                 <div className="space-y-2">
                    <Button onClick={handleManualCheck} isLoading={isLoading} className="bg-green-600 hover:bg-green-700 h-16 text-white text-xl font-black shadow-2xl shadow-green-100 rounded-[2rem] uppercase tracking-tighter">
                        Confirm Transfer Made
                    </Button>
                    <div className="bg-slate-50 p-5 rounded-3xl text-center border border-slate-100">
                        <div className="flex items-center justify-center gap-3 text-slate-600 mb-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Gateway Signal</span>
                        </div>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Transaction is monitored 24/7</p>
                    </div>
                 </div>
             </div>
         )}

         {step === 'success' && selectedProduct && paymentDetails && (
             <div className="text-center space-y-6 py-4">
                 <SharedReceipt 
                    ref={receiptRef}
                    transaction={generateReceiptData(finalTx || {
                        tx_ref: paymentDetails.tx_ref,
                        amount: paymentDetails.amount,
                        createdAt: new Date().toISOString(),
                        type: 'ecommerce',
                        product: selectedProduct,
                        description: selectedProduct.name + (upsellSim ? ` + ${upsellSim.name}` : ''),
                        status: 'paid',
                        customerName: formData.name,
                        customerPhone: formData.phone
                    }, agent)}
                 />

                 <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200 animate-in zoom-in duration-500 scale-110">
                     <CheckCircle2 className="w-12 h-12 text-white" />
                 </div>
                 <div>
                     <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">ORDER CONFIRMED!</h2>
                     <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest">Verification Successful • Dispatching Shortly</p>
                     <div className="bg-blue-600 p-6 rounded-[2.5rem] mt-8 border-none text-left relative overflow-hidden shadow-2xl shadow-blue-100">
                         <Zap className="absolute -right-6 -top-6 w-24 h-24 text-white/10" />
                         <p className="font-black text-white text-sm flex items-center gap-2 uppercase tracking-tight">
                             <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                             Logistics Priority
                         </p>
                         <p className="text-[10px] text-blue-100 mt-2 font-bold uppercase tracking-wide">Our logistics hub will contact <strong>{formData.phone}</strong> to coordinate final delivery.</p>
                     </div>
                 </div>
                 
                 <div className="flex flex-col gap-3 pt-6">
                     <Button 
                        onClick={downloadReceipt}
                        className="bg-slate-900 text-white shadow-2xl shadow-slate-200 h-16 text-xl font-black rounded-[2rem] uppercase tracking-tighter"
                    >
                        <Download className="w-5 h-5 mr-3" /> Get Digital Receipt
                     </Button>
                     <Button variant="ghost" onClick={handleClose} className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Close Dashboard</Button>
                 </div>
             </div>
         )}
      </BottomSheet>
      )}
    </div>
  );
};
