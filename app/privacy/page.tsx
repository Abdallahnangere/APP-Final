'use client';

import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <div className="text-slate-600 text-sm leading-relaxed">
            {children}
        </div>
    </section>
);

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-lg font-black uppercase tracking-tight">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black mb-2">SAUKI MART</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-6">Last Updated: December 29, 2025</p>
            <p className="text-slate-600 leading-relaxed">
                Sauki Data Links ("we," "our," or "us") operates the Sauki Mart mobile application. 
                This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
        </div>

        <div className="space-y-8">
            <Section title="1. Information We Collect">
                <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Phone number, First name and last name, Cookies and Usage Data.</li>
                    <li><strong>Transaction Data:</strong> We collect details of transactions you carry out through our App and of the fulfillment of your orders.</li>
                    <li><strong>Device Information:</strong> We may collect information about your mobile device, including the hardware model, operating system, and unique device identifiers.</li>
                </ul>
            </Section>

            <Section title="2. How We Use Your Data">
                <p>Sauki Mart uses the collected data for various purposes:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>To provide and maintain the Service (Instant Data, Airtime, Device Sales).</li>
                    <li>To notify you about changes to our Service.</li>
                    <li>To allow you to participate in interactive features of our Service (Agent Hub) when you choose to do so.</li>
                    <li>To provide customer care and support.</li>
                    <li>To detect, prevent and address technical issues and fraud.</li>
                </ul>
            </Section>

            <Section title="3. Payment Processing">
                <p>
                    We provide paid products and/or services within the Service. In that case, we use third-party services for payment processing (e.g., Flutterwave).
                </p>
                <p className="mt-2">
                    We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy. These payment processors adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council.
                </p>
            </Section>

            <Section title="4. Data Security">
                <div className="flex items-start gap-4 bg-slate-100 p-4 rounded-xl">
                    <Lock className="w-6 h-6 text-slate-500 shrink-0" />
                    <p className="text-sm text-slate-600">
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </div>
            </Section>

            <Section title="5. Service Providers">
                <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, or to assist us in analyzing how our Service is used.</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Flutterwave:</strong> For payment processing.</li>
                    <li><strong>Amigo/Telecommunication Networks:</strong> For data and airtime vending API fulfillment.</li>
                    <li><strong>Google Analytics:</strong> For tracking app performance.</li>
                </ul>
            </Section>

            <Section title="6. Your Rights (NDPA 2023)">
                <p>In compliance with the Nigeria Data Protection Act 2023, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Access your personal data.</li>
                    <li>Request correction of inaccurate data.</li>
                    <li>Request deletion of your data (Right to be Forgotten).</li>
                    <li>Withdraw consent at any time.</li>
                </ul>
                <p className="mt-2 font-bold">To request account deletion, please contact us at the email below.</p>
            </Section>

            <Section title="7. Contact Us">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <div className="mt-4 grid gap-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="font-bold">saukidatalinks@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="font-bold">+234 806 193 4056</span>
                    </div>
                </div>
            </Section>

        </div>
      </div>
    </div>
  );
              }
