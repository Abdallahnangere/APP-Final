
import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, FileText, ChevronRight, HelpCircle, AlertTriangle, CheckCircle2, ArrowRight, Globe, Users } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { LegalDocs } from './LegalDocs';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { toast } from '../../lib/toast';
import { cn } from '../../lib/utils';

interface SupportProps {
    onBack?: () => void;
}

export const Support: React.FC<SupportProps> = ({ onBack }) => {
  const [activeSheet, setActiveSheet] = useState<'complaint' | 'legal' | null>(null);

  const openWhatsApp = (number: string) => {
      window.open(`https://wa.me/234${number.substring(1)}`, '_blank');
  };

  const openCall = (number: string) => {
      window.open(`tel:${number}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        {/* Sticky Header with Gradient */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-white via-white to-transparent pb-4">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Help Center</h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">We're here to help you 24/7</p>
            </div>
        </div>

        <div className="px-6 py-6 space-y-6 pb-20 max-w-2xl mx-auto">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">24/7</p>
                    <p className="text-[9px] font-bold text-blue-600 mt-1 uppercase">Always Open</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-black text-green-600">&lt;5min</p>
                    <p className="text-[9px] font-bold text-green-600 mt-1 uppercase">Avg Response</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-black text-purple-600">98%</p>
                    <p className="text-[9px] font-bold text-purple-600 mt-1 uppercase">Satisfaction</p>
                </div>
            </div>

            {/* Section 1: Immediate Actions */}
            <section className="space-y-3">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Quick Actions</h3>
                <div className="space-y-2">
                    <button 
                        onClick={() => window.open(`https://wa.me/2348061934056?text=Hi, I need help with Sauki Mart`, '_blank')} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold flex items-center justify-between active:scale-95 transition-all shadow-lg shadow-green-600/20"
                    >
                        <div className="flex items-center gap-3">
                            <MessageCircle className="w-6 h-6" />
                            <div className="text-left">
                                <p className="text-sm font-black uppercase">WhatsApp Support</p>
                                <p className="text-xs font-semibold opacity-90">Fastest response time</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={() => setActiveSheet('complaint')} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold flex items-center justify-between active:scale-95 transition-all shadow-lg shadow-red-600/20"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6" />
                            <div className="text-left">
                                <p className="text-sm font-black uppercase">File a Complaint</p>
                                <p className="text-xs font-semibold opacity-90">Transaction issues</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Section 2: Contact Methods */}
            <section className="space-y-3">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Contact Methods</h3>
                <div className="space-y-3">
                    {/* Phone */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Customer Care</p>
                                    <p className="text-sm font-bold text-slate-900">0806 193 4056</p>
                                    <p className="text-[9px] text-slate-500 mt-1">Call Mon-Fri, 8am-6pm WAT</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => window.open('tel:08061934056')} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors flex-shrink-0">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button onClick={() => window.open('https://wa.me/2348061934056?text=Hi, I need support with Sauki Mart', '_blank')} className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors flex-shrink-0">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tech Support */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-purple-600 uppercase mb-1">Tech Support</p>
                                    <p className="text-sm font-bold text-slate-900">0704 464 7081</p>
                                    <p className="text-[9px] text-slate-500 mt-1">App issues & technical help</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => window.open('tel:07044647081')} className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors flex-shrink-0">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button onClick={() => window.open('https://wa.me/2347044647081?text=Hi, I need technical support with Sauki Mart', '_blank')} className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors flex-shrink-0">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 flex-shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">Email Support</p>
                                    <p className="text-sm font-bold text-slate-900 break-all">saukidatalinks@gmail.com</p>
                                    <p className="text-[9px] text-slate-500 mt-1">Response within 24 hours</p>
                                </div>
                            </div>
                            <button onClick={() => window.open('mailto:saukidatalinks@gmail.com')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex-shrink-0">
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Website */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase mb-1">Visit Website</p>
                                    <p className="text-sm font-bold text-slate-900">www.saukimart.online</p>
                                    <p className="text-[9px] text-slate-500 mt-1">Learn more & FAQs</p>
                                </div>
                            </div>
                            <button onClick={() => window.open('https://www.saukimart.online', '_blank')} className="p-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors flex-shrink-0">
                                <Globe className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Legal & Docs */}
            <section className="space-y-3">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Information</h3>
                <button 
                    onClick={() => setActiveSheet('legal')} 
                    className="w-full bg-white border border-slate-200 hover:shadow-md transition-all rounded-xl p-4 flex items-center justify-between active:scale-95"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-slate-900">Terms & Privacy</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Legal documentation</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
            </section>

            {/* FAQ Section */}
            <section className="space-y-3">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Common Questions</h3>
                <div className="space-y-2">
                    {[
                        { q: "How do I track my transaction?", a: "Go to Track tab, enter your phone number to see all transactions" },
                        { q: "What if my transaction failed?", a: "Your payment will be refunded to your wallet within 2 hours" },
                        { q: "How long does delivery take?", a: "Digital products (data/airtime) are instant. Physical products 3-5 days" },
                        { q: "Can I get a refund?", a: "Digital products are final. Physical products have 7-day guarantee" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex gap-3">
                                <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase mb-1">{item.q}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        <BottomSheet isOpen={!!activeSheet} onClose={() => setActiveSheet(null)} title={activeSheet === 'complaint' ? 'Lodge Complaint' : 'Legal Documents'}>
            {activeSheet === 'complaint' && <ComplaintForm onClose={() => setActiveSheet(null)} />}
            {activeSheet === 'legal' && <LegalDocs />}
        </BottomSheet>
    </div>
  );
};

const ComplaintForm = ({ onClose }: { onClose: () => void }) => {
    const [form, setForm] = useState({ phone: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async () => {
        if (!form.phone || !form.message) return toast.error("Please fill all fields");
        setStatus('submitting');
        try {
            await fetch('/api/support', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form)
            });
            setStatus('success');
        } catch (e) {
            toast.error("Failed to send. Check connection.");
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Complaint Received</h3>
                    <p className="text-slate-500 mt-2 px-4 leading-relaxed">
                        We have notified the admin team. We will investigate your transaction and get back to you shortly.
                    </p>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-[1.5rem] border border-amber-100 text-left">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm uppercase">Is it Urgent?</h4>
                            <p className="text-xs text-amber-700 mt-1 mb-4">If you need immediate resolution, please contact us on WhatsApp with your Transaction ID.</p>
                            <button 
                                onClick={() => window.open(`https://wa.me/2348061934056?text=URGENT COMPLAINT: ${encodeURIComponent(form.message)}`, '_blank')}
                                className="w-full bg-green-600 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                            >
                                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
                
                <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-500">
                Please provide the phone number used for the transaction and a brief description of the error.
            </div>
            <Input 
                label="Affected Phone Number" 
                placeholder="080..." 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
            />
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Issue Details</label>
                <textarea 
                    className="w-full p-4 bg-slate-100 rounded-2xl h-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium text-slate-900"
                    placeholder="E.g. I bought 1GB data but didn't receive it..."
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                />
            </div>
            <Button onClick={handleSubmit} isLoading={status === 'submitting'} className="bg-slate-900 text-white h-14 rounded-2xl font-bold shadow-xl">
                Submit Complaint
            </Button>
        </div>
    );
}
