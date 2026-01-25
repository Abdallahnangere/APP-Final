
import React from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '../ui/Button';
import { Download, ShieldCheck, FileText } from 'lucide-react';

export const LegalDocs: React.FC = () => {

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // --- Header ---
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SAUKI MART - LEGAL DOCUMENTS", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // --- Privacy Policy Section ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PRIVACY POLICY", margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const privacyContent = `
Sauki Data Links ("we," "us," "our," or "the Company") is committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, disclose, store, and protect your personal information when you use the SAUKI MART mobile application (the "App"), our associated services, or interact with us.

We process personal data in strict compliance with the Nigeria Data Protection Act 2023 ("NDPA").

1. INFORMATION WE COLLECT
a. Information You Provide Directly: Contact details: Phone number, email address, and name. Transaction-related information.
b. Information Collected Automatically: Device information and Usage data.
c. Information from Third Parties: Payment verification data from Flutterwave.

2. HOW WE USE YOUR PERSONAL DATA
- To provide and maintain our services.
- To verify transactions and prevent fraud.
- To communicate with you.
- To comply with legal obligations.

3. DATA SECURITY
We implement appropriate technical and organisational measures to protect your Personal Data, including encryption and access controls.

4. YOUR RIGHTS
Under the NDPA, you have the right to Access, Rectify, Erase, Restrict, and Object to processing of your data. Contact us at saukidatalinks@gmail.com.
    `;

    const splitPrivacy = doc.splitTextToSize(privacyContent.trim(), maxLineWidth);
    doc.text(splitPrivacy, margin, yPos);
    yPos += (splitPrivacy.length * 4) + 10;

    // --- Terms of Service Section ---
    if (yPos > 250) { doc.addPage(); yPos = 20; } // Check page break

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS OF SERVICE", margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const termsContent = `
These Terms of Service constitute a legally binding agreement between you and Sauki Data Links.

1. SERVICES
The App acts as an intermediary platform facilitating:
- Purchase and instant delivery of airtime and data bundles.
- Purchase and delivery of physical mobile devices.
- Payment processing via secure gateways.

2. PAYMENTS AND REFUNDS
- Digital Products (Airtime/Data Bundles): Sales are final and non-refundable once successfully delivered.
- Failed Deliveries: If payment is successful but delivery fails, we will retry or refund your wallet.
- Physical Products: Refunds or returns subject to inspection for defects within 7 days.

3. USER OBLIGATIONS
You agree to provide accurate information, including correct phone numbers for VTU transactions.

4. LIMITATION OF LIABILITY
Services are provided "as is". We are not liable for network failures of third-party Telecommunication Providers.

5. CONTACT US
Email: saukidatalinks@gmail.com
Phone: +2348061934056 and +2347044647081
    `;

    const splitTerms = doc.splitTextToSize(termsContent.trim(), maxLineWidth);
    doc.text(splitTerms, margin, yPos);

    doc.save("Sauki_Mart_Legal_Documents.pdf");
  };

  return (
    <div className="min-h-screen bg-white">
       {/* Sticky Header with Gradient */}
       <div className="sticky top-0 z-20 bg-gradient-to-b from-white via-white to-transparent pb-4">
           <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
               <div className="flex-1">
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Legal & Privacy</h2>
                   <p className="text-xs text-slate-500 font-semibold mt-1">Official Documentation</p>
               </div>
               <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs shadow-lg hover:bg-slate-800 transition-colors active:scale-95">
                   <Download className="w-4 h-4" /> Download
               </button>
           </div>
       </div>

       {/* Scrollable Content with Enhanced Layout */}
       <div className="px-6 py-6 space-y-8 pb-20 max-w-3xl mx-auto">
           
           {/* Privacy Policy */}
           <section className="space-y-4">
               <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-200">
                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                       <ShieldCheck className="w-6 h-6" />
                   </div>
                   <div>
                       <h3 className="text-xl font-black text-slate-900">Privacy Policy</h3>
                       <p className="text-xs text-slate-500 font-mono">Effective: December 29, 2025</p>
                   </div>
               </div>
               
               <div className="space-y-3 text-sm leading-relaxed">
                   <p><strong className="text-slate-900">Sauki Data Links</strong> respects your privacy. We collect personal data only to provide and improve our services, in full compliance with the <strong>Nigeria Data Protection Act 2023</strong>.</p>
                   
                   <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                       <h4 className="font-bold text-slate-900 text-sm">📋 What We Collect</h4>
                       <ul className="space-y-1 text-xs text-slate-600">
                           <li>✓ Contact Info: Name, phone, email</li>
                           <li>✓ Transaction Data: Purchase history, delivery addresses</li>
                           <li>✓ Device Info: IP address, device type, OS</li>
                           <li>✓ Payment Data: Via Flutterwave (PCI-DSS compliant)</li>
                       </ul>
                   </div>

                   <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                       <h4 className="font-bold text-slate-900 text-sm">🔐 How We Protect You</h4>
                       <ul className="space-y-1 text-xs text-slate-600">
                           <li>✓ End-to-end encryption for all transactions</li>
                           <li>✓ Regular security audits and penetration testing</li>
                           <li>✓ Strict access controls and data isolation</li>
                           <li>✓ Compliant with international security standards</li>
                       </ul>
                   </div>

                   <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                       <h4 className="font-bold text-slate-900 text-sm">👤 Your Rights</h4>
                       <ul className="space-y-1 text-xs text-slate-600">
                           <li>✓ Right to Access: Request a copy of your data</li>
                           <li>✓ Right to Rectify: Correct inaccurate information</li>
                           <li>✓ Right to Erase: Request data deletion</li>
                           <li>✓ Right to Withdraw: Opt-out of communications</li>
                       </ul>
                   </div>

                   <p className="text-xs text-slate-500 italic">For privacy inquiries, contact: <strong>dpo@saukimart.online</strong></p>
               </div>
           </section>

           {/* Terms of Service */}
           <section className="space-y-4">
               <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-200">
                   <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                       <FileText className="w-6 h-6" />
                   </div>
                   <div>
                       <h3 className="text-xl font-black text-slate-900">Terms of Service</h3>
                       <p className="text-xs text-slate-500 font-mono">Effective: December 29, 2025</p>
                   </div>
               </div>
               
               <div className="space-y-3 text-sm leading-relaxed">
                   <p>By using Sauki Mart, you agree to these terms. We provide a platform for purchasing digital and physical products through verified payment channels.</p>
                   
                   <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                       <h4 className="font-bold text-slate-900 text-sm">💳 Payments & Refunds</h4>
                       <ul className="space-y-1 text-xs text-slate-600">
                           <li>✓ <strong>Digital Products</strong> (Data, Airtime): Final sale once delivered</li>
                           <li>✓ <strong>Failed Delivery</strong>: Automatic refund to wallet within 2 hours</li>
                           <li>✓ <strong>Physical Products</strong>: 7-day quality guarantee</li>
                           <li>✓ <strong>Wallet Transfers</strong>: All final - cannot be reversed</li>
                       </ul>
                   </div>

                   <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                       <h4 className="font-bold text-slate-900 text-sm">⚠️ Important Notice</h4>
                       <p className="text-xs text-slate-600">We are <strong>not</strong> responsible for incorrect phone numbers provided by you. Please verify all details before confirming purchases.</p>
                   </div>

                   <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                       <h4 className="font-bold text-slate-900 text-sm">📞 Liability Limitation</h4>
                       <p className="text-xs text-slate-600">Network providers (MTN, Airtel, Glo, 9mobile) are responsible for service delivery. Sauki Mart is an intermediary and not liable for network failures.</p>
                   </div>

                   <p className="text-xs text-slate-500 italic">For terms inquiries: <strong>legal@saukimart.online</strong></p>
               </div>
           </section>

           {/* Contact Section */}
           <section className="sticky bottom-0 bg-gradient-to-t from-white via-white pt-6 pb-20">
               <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
                   <h4 className="font-black text-lg">Questions?</h4>
                   <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                       <button onClick={() => window.open('mailto:legal@saukimart.online')} className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors">
                           📧 Email Legal Team
                       </button>
                       <button onClick={() => window.open('https://wa.me/2348061934056', '_blank')} className="bg-green-600 hover:bg-green-700 p-3 rounded-lg transition-colors">
                           💬 WhatsApp Support
                       </button>
                   </div>
               </div>
           </section>
       </div>
    </div>
  );
};
