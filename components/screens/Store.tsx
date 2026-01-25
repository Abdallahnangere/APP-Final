
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Product, PaymentInitResponse, Agent } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, cn, saveToLocalHistory, generateReceiptData } from '../../lib/utils';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PINKeyboard } from '../ui/PINKeyboard';
import { Loader2, CheckCircle2, Copy, Download, RefreshCw, ShoppingBag, Plus, Smartphone, ShieldCheck, Truck, Zap, Wallet, ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';
import { BrandedReceipt } from '../BrandedReceipt';
import { toast } from '../../lib/toast';

interface StoreProps {
    agent?: Agent;
    onBack?: () => void;
}

const CategorySection: React.FC<{
  title: string;
  products: Product[];
  icon: string;
  onSelect: (p: Product) => void;
}> = ({ title, products, icon, onSelect }) => {
  const MotionDiv = motion.div as any;
  
  if (products.length === 0) return null;
  
  return (
    <div>
      <div className="px-2 mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{title}</h2>
        <span className="text-xs font-semibold text-slate-500 ml-auto">{products.length} item{products.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <MotionDiv
            key={product.id}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(product)}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all active:scale-95"
          >
            {/* Product Image */}
            <div className="w-full aspect-square bg-slate-50 flex items-center justify-center p-3 border-b border-slate-100 group-hover:bg-slate-100 transition-colors">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
            </div>
            
            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-tight mb-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-lg">
                  {formatCurrency(product.price)}
                </span>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md border border-green-200">
                  In Stock
                </span>
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
};

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
  
  const deviceCount = products.filter(p => (p.category || 'device') === 'device').length;
  const simCount = products.filter(p => p.category === 'sim').length;
  const packageCount = products.filter(p => p.category === 'package').length;

  const MotionDiv = motion.div as any;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {receiptTx && (
          <BrandedReceipt ref={receiptRef} transaction={generateReceiptData(finalTx || {})} />
      )}

      {/* Clean Apple-style Header */}
      <div className="px-6 pt-safe pb-3 bg-white shrink-0 flex items-center gap-4 border-b border-slate-100">
        {onBack && (
          <button 
            onClick={onBack} 
            className="p-2 text-slate-600 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Store</h1>
        </div>
      </div>

      {!selectedProduct ? (
        <>
          {/* Three-Column Category Grid - All visible */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-4 space-y-4">
            {isLoading && products.length === 0 ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
            ) : (
              <div className="space-y-4">
                {/* CATEGORY NAVIGATION CARDS */}
                <div className="grid grid-cols-3 gap-2">
                  <MotionDiv 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('device')}
                    className={cn("p-3 rounded-xl text-center cursor-pointer transition-all border", 
                      activeTab === 'device' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300')}
                  >
                    <div className="text-2xl mb-1">📱</div>
                    <p className="text-xs font-bold uppercase tracking-tight">Devices</p>
                    <p className="text-[10px] opacity-70">{deviceCount}</p>
                  </MotionDiv>
                  
                  <MotionDiv 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('sim')}
                    className={cn("p-3 rounded-xl text-center cursor-pointer transition-all border", 
                      activeTab === 'sim' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300')}
                  >
                    <div className="text-2xl mb-1">🔌</div>
                    <p className="text-xs font-bold uppercase tracking-tight">SIMs</p>
                    <p className="text-[10px] opacity-70">{simCount}</p>
                  </MotionDiv>
                  
                  <MotionDiv 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('package')}
                    className={cn("p-3 rounded-xl text-center cursor-pointer transition-all border", 
                      activeTab === 'package' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300')}
                  >
                    <div className="text-2xl mb-1">🎁</div>
                    <p className="text-xs font-bold uppercase tracking-tight">Packages</p>
                    <p className="text-[10px] opacity-70">{packageCount}</p>
                  </MotionDiv>
                </div>

                {/* PRODUCTS FOR SELECTED TAB */}
                <div>
                  <CategorySection 
                    title={activeTab === 'device' ? 'Devices' : activeTab === 'sim' ? 'Data SIMs' : 'Full Packages'} 
                    products={displayedProducts}
                    icon={activeTab === 'device' ? '📱' : activeTab === 'sim' ? '🔌' : '🎁'}
                    onSelect={setSelectedProduct}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* PRODUCT DETAIL VIEW */
        <BottomSheet isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setStep('details'); }} title="">
           {step === 'details' && selectedProduct && (
               <div className="space-y-4">
                   {/* Product Image */}
                   <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-slate-200">
                       <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                   
                   <div className="space-y-4 px-2">
                       {/* Product Name & Price */}
                       <div>
                           <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight mb-1">
                             {selectedProduct.name}
                           </h2>
                           <p className="text-3xl font-black text-slate-900 tracking-tight">
                             {formatCurrency(selectedProduct.price)}
                           </p>
                       </div>

                       {/* Description */}
                       {selectedProduct.description && (
                           <div>
                               <p className="text-sm text-slate-600 leading-relaxed">
                                   {selectedProduct.description}
                               </p>
                           </div>
                       )}

                       {/* SIM Upsell - Clean Style */}
                       {(selectedProduct.category === 'device' || selectedProduct.category === 'package') && availableSims.length > 0 && (
                           <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                               <label className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 block">
                                   Add Data SIM
                               </label>
                               <select 
                                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  value={selectedSimId}
                                  onChange={(e) => setSelectedSimId(e.target.value)}
                               >
                                   <option value="">None</option>
                                   {availableSims.map(sim => (
                                       <option key={sim.id} value={sim.id}>
                                           {sim.name} — +{formatCurrency(sim.price)}
                                       </option>
                                   ))}
                               </select>
                           </div>
                       )}

                       {/* Total Price */}
                       {currentTotal > selectedProduct.price && (
                         <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                           <span className="text-sm font-semibold text-blue-900">Bundle Total</span>
                           <span className="font-black text-blue-900 text-xl">{formatCurrency(currentTotal)}</span>
                         </div>
                       )}
                   </div>

                   <Button onClick={handleBuyNow} className="bg-slate-900 text-white h-12 font-bold rounded-xl uppercase tracking-wide w-full mt-4">
                       {agent ? "Pay with Wallet" : "Continue"} →
                   </Button>
               </div>
           )}

         {step === 'form' && selectedProduct && (
             <div className="space-y-4">
                 {/* Order Summary */}
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-2 border border-slate-100">
                      <img src={selectedProduct.image} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Order Total</p>
                        <p className="text-lg font-black text-slate-900 uppercase mt-0.5">{selectedProduct.name}</p>
                        <p className="text-base font-black text-blue-600 mt-1">{formatCurrency(currentTotal)}</p>
                    </div>
                 </div>

                 {/* Form Fields */}
                 <div className="space-y-3">
                   <div>
                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">Full Name</label>
                     <Input placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-lg h-11 font-semibold text-sm bg-white border border-slate-200" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">Phone Number</label>
                     <Input type="tel" placeholder="08012345678" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-lg h-11 font-semibold text-sm bg-white border border-slate-200" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">Delivery Address</label>
                     <Input placeholder="Apartment, Street, City, State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="rounded-lg h-11 font-semibold text-sm bg-white border border-slate-200" />
                   </div>
                 </div>
                 
                 <Button onClick={handleBuyNow} isLoading={isLoading} className="bg-slate-900 text-white h-12 font-bold rounded-lg uppercase tracking-wide shadow-lg w-full mt-2">
                     {agent ? "Authorize Charge" : "Continue to Payment"}
                 </Button>
             </div>
         )}

         {step === 'agent_pin' && agent && (
             <div className="space-y-4">
                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                   <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Wallet Debit</p>
                   <p className="text-3xl font-black text-blue-900">{formatCurrency(currentTotal)}</p>
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
                 <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl text-center">
                     <p className="text-xs text-orange-900 mb-2 font-bold uppercase tracking-wide">Transfer Exactly</p>
                     <p className="text-4xl font-black text-orange-900">{formatCurrency(paymentDetails.amount)}</p>
                     <p className="text-xs text-orange-700 mt-2 font-semibold">{isPolling && <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Verifying...</span>}</p>
                 </div>
                 
                 <div className="space-y-2">
                     <div className="bg-white border border-slate-200 p-4 rounded-lg">
                         <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Bank Name</p>
                         <p className="font-black text-slate-900 text-base uppercase">{paymentDetails.bank}</p>
                     </div>
                     <div className="bg-white border-2 border-slate-200 p-4 rounded-lg flex items-center justify-between group hover:border-blue-300 transition-all">
                         <div>
                             <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Account Number</p>
                             <p className="font-black text-2xl text-slate-900 font-mono">{paymentDetails.account_number}</p>
                         </div>
                         <Button variant="ghost" className="w-10 h-10 p-0 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg" onClick={() => {
                             navigator.clipboard.writeText(paymentDetails.account_number);
                             toast.success("Copied!");
                         }}>
                             <Copy className="w-5 h-5" />
                         </Button>
                     </div>
                     <div className="bg-white border border-slate-200 p-4 rounded-lg">
                         <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Beneficiary Name</p>
                         <p className="font-black text-slate-900 text-sm uppercase">{paymentDetails.account_name}</p>
                     </div>
                 </div>

                 <div className="space-y-2 mt-4">
                    <Button onClick={handleManualCheck} isLoading={isLoading} className="bg-green-600 hover:bg-green-700 h-11 text-white font-bold shadow-lg rounded-lg uppercase tracking-wide w-full">
                        Confirm Payment Made
                    </Button>
                    <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Payment is being monitored</p>
                    </div>
                 </div>
             </div>
         )}

         {step === 'success' && selectedProduct && paymentDetails && (
             <div className="text-center space-y-4 py-2">
                 <BrandedReceipt 
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

                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg border border-green-200">
                     <CheckCircle2 className="w-9 h-9 text-green-600" />
                 </div>
                 
                 <div>
                     <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Order Confirmed!</h2>
                     <p className="text-xs text-slate-600 mt-1 font-semibold uppercase">Dispatch in progress</p>
                 </div>
                 
                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                     <p className="font-bold text-blue-900 text-sm flex items-center gap-2 justify-center">
                         <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                         We'll contact {formData.phone}
                     </p>
                     <p className="text-xs text-blue-700 mt-1">for final delivery coordination</p>
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
      )}
    </div>
  );
};
