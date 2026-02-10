// Airtel SIM Remote Activation Component
// File: components/AirtSIMActivation.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Upload, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AirtSIMProduct, PaymentInitResponse } from '../types';
import { api } from '../lib/api';
import { formatCurrency, cn, saveToLocalHistory, generateReceiptData } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BottomSheet } from './ui/BottomSheet';
import { toast } from '../lib/toast';
import { BrandedReceipt } from './BrandedReceipt';
import { toPng } from 'html-to-image';

interface AirtSIMActivationProps {
  onClose?: () => void;
  agent?: any;
}

const MotionDiv = motion.div as any;

export const AirtSIMActivation: React.FC<AirtSIMActivationProps> = ({ onClose, agent }) => {
  const [step, setStep] = useState<'info' | 'select' | 'upload' | 'form' | 'payment' | 'success'>('info');
  const [products, setProducts] = useState<AirtSIMProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AirtSIMProduct | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Image upload
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontImageUrl, setFrontImageUrl] = useState<string>('');
  const [backImageUrl, setBackImageUrl] = useState<string>('');
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    imeiNumber: ''
  });

  // Payment
  const [paymentDetails, setPaymentDetails] = useState<PaymentInitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const []receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);

  // Load Airtel SIM products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/airtel-sim-products');
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load SIM products');
      console.error(error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Image handling
  const handleImageUpload = (file: File, type: 'front' | 'back') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (type === 'front') {
        setFrontImage(file);
        setFrontImageUrl(url);
        toast.success('Front image uploaded');
      } else {
        setBackImage(file);
        setBackImageUrl(url);
        toast.success('Back image uploaded');
      }
    };
    reader.readAsDataURL(file);
  };

  // Initiate payment
  const handleInitiatePayment = async () => {
    if (!selectedProduct || !formData.customerName || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!frontImageUrl || !backImageUrl) {
      toast.error('Please upload both SIM images');
      return;
    }

    setIsLoading(true);
    try {
      // Create SIM order first
      const orderResponse = await fetch('/api/airtel-sim-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          customerName: formData.customerName,
          phone: formData.phone,
          email: formData.email,
          imeiNumber: formData.imeiNumber,
          simFrontImageUrl: frontImageUrl,
          simBackImageUrl: backImageUrl,
          agentId: agent?.id
        })
      });

      if (!orderResponse.ok) throw new Error('Failed to create order');
      const order = await orderResponse.json();

      // Initiate payment
      const paymentResponse = await fetch('/api/ecommerce/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'airtel_sim',
          phone: formData.phone,
          amount: selectedProduct.price,
          customerName: formData.customerName,
          agentId: agent?.id,
          orderRef: order.orderRef,
          orderType: 'airtel_sim'
        })
      });

      if (!paymentResponse.ok) throw new Error('Failed to initiate payment');
      const payment = await paymentResponse.json();
      setPaymentDetails(payment);
      setStep('payment');

      // Poll for payment status
      pollPaymentStatus(order.orderRef);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment initiation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for payment completion
  const pollPaymentStatus = (orderRef: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/airtel-sim-orders/${orderRef}/status`);
        if (response.ok) {
          const order = await response.json();
          if (order.status === 'completed' || order.status === 'paid') {
            clearInterval(pollInterval);
            setReceiptTx({
              tx_ref: order.orderRef,
              amount: order.price,
              status: 'success',
              type: 'airtel_sim',
              customerName: order.customerName,
              phone: order.phone,
              createdAt: new Date().toISOString()
            });
            setStep('success');
          }
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 2000);

    // Clear poll after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
  };

  // Export receipt
  const downloadReceipt = async () => {
    if (receiptRef.current) {
      try {
        const image = await toPng(receiptRef.current);
        const link = document.createElement('a');
        link.href = image;
        link.download = `airtel-sim-${receiptTx.tx_ref}.png`;
        link.click();
      } catch (error) {
        toast.error('Failed to download receipt');
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === 'info' && (
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-200">
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Airtel SIM Remote Activation</h2>
                <p className="text-sm text-slate-600">Activate your Airtel SIM card from anywhere, anytime!</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-lg">How It Works</h3>
            <div className="space-y-3">
              {[
                { num: '1', title: 'Buy a SIM', desc: 'Purchase an Airtel SIM card from any store or online' },
                { num: '2', title: 'Take Photos', desc: 'Photograph the front and back of your SIM card clearly' },
                { num: '3', title: 'Upload & Pay', desc: 'Upload photos, fill our form, and pay via Flutterwave' },
                { num: '4', title: 'Activated!', desc: 'Your SIM will be activated within 5 hours' }
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-black flex-shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setStep('select')}
            className="w-full"
            size="lg"
          >
            Select Product <ChevronRight className="w-5 h-5" />
          </Button>
        </MotionDiv>
      )}

      {step === 'select' && (
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <ChevronRight className="w-5 h-5" />
            Select Product
          </h3>

          {isLoadingProducts ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">No products available</p>
                <p className="text-sm text-yellow-700">Airtel SIM products are not yet configured</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {products.map((product) => (
                <MotionDiv
                  key={product.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setStep('upload');
                  }}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'bg-white hover:shadow-md',
                    'border-slate-200'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900">{product.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{product.description}</p>
                      {product.dataPackage && (
                        <p className="text-xs text-blue-600 font-semibold mt-2">
                          📦 {product.dataPackage} • {product.validity}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-slate-500 mt-1">per SIM</p>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
          )}

          <Button variant="outline" onClick={() => setStep('info')} className="w-full">
            Back
          </Button>
        </MotionDiv>
      )}

      {step === 'upload' && selectedProduct && (
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-black text-slate-900 text-lg">Upload SIM Card Photos</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Front Image */}
            <div
              onClick={() => frontInputRef.current?.click()}
              className={cn(
                'aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-all',
                'flex items-center justify-center bg-slate-50',
                frontImageUrl ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-blue-500'
              )}
            >
              {frontImageUrl ? (
                <img src={frontImageUrl} alt="Front" className="w-full h-full object-cover rounded-md" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Front</p>
                </div>
              )}
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'front')}
                className="hidden"
              />
            </div>

            {/* Back Image */}
            <div
              onClick={() => backInputRef.current?.click()}
              className={cn(
                'aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-all',
                'flex items-center justify-center bg-slate-50',
                backImageUrl ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-blue-500'
              )}
            >
              {backImageUrl ? (
                <img src={backImageUrl} alt="Back" className="w-full h-full object-cover rounded-md" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Back</p>
                </div>
              )}
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'back')}
                className="hidden"
              />
            </div>
          </div>

          {frontImageUrl && backImageUrl && (
            <Button
              onClick={() => setStep('form')}
              className="w-full"
              size="lg"
            >
              Proceed <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          <Button variant="outline" onClick={() => setStep('select')} className="w-full">
            Back
          </Button>
        </MotionDiv>
      )}

      {step === 'form' && selectedProduct && (
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-black text-slate-900 text-lg">Complete Your Details</h3>

          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Email (optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="IMEI Number (optional)"
              value={formData.imeiNumber}
              onChange={(e) => setFormData({ ...formData, imeiNumber: e.target.value })}
            />
          </div>

          <Button
            onClick={handleInitiatePayment}
            disabled={isLoading || !formData.customerName || !formData.phone}
            className="w-full"
            size="lg"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ChevronRight className="w-5 h-5" />}
            Pay {formatCurrency(selectedProduct.price)}
          </Button>

          <Button variant="outline" onClick={() => setStep('upload')} className="w-full">
            Back
          </Button>
        </MotionDiv>
      )}

      {step === 'payment' && paymentDetails && (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold">Redirecting to Flutterwave...</p>
            <p className="text-xs text-blue-700 mt-2">Payment amount: {formatCurrency(selectedProduct?.price || 0)}</p>
          </div>
          <Button
            onClick={() => window.open(paymentDetails.authorization_url, '_blank')}
            className="w-full"
            size="lg"
          >
            Complete Payment
          </Button>
        </MotionDiv>
      )}

      {step === 'success' && receiptTx && (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-900 mb-1">Order Confirmed!</h3>
            <p className="text-sm text-slate-600">Your SIM activation order has been received</p>
            <p className="text-xs text-slate-500 mt-3">Activation within 5 hours</p>
          </div>

          <div ref={receiptRef} className="hidden">
            <BrandedReceipt tx={receiptTx} />
          </div>

          <Button onClick={downloadReceipt} variant="outline" className="w-full">
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>

          <Button onClick={onClose} className="w-full" size="lg">
            Done
          </Button>
        </MotionDiv>
      )}
    </div>
  );
};

export default AirtSIMActivation;
