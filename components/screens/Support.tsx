
import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, FileText, ChevronRight, HelpCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F2F2F7]">
        {/* iOS Style Large Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 pt-safe pb-4 px-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support</h1>
        </div>

        <div className="p-5 space-y-8 pb-32">
            
            {/* Section 1: Complaint (Top Priority) */}
            <section>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-4">Resolution Center</h3>
                <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100">
                    <button 
                        onClick={() => setActiveSheet('complaint')} 
                        className="w-full p-5 flex items-center justify-between active:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-bold text-slate-900">Lodge a Complaint</h4>
                                <p className="text-xs text-slate-500">Report failed transactions or issues</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                </div>
            </section>

            {/* Section 2: Contact Methods */}
            <section>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-4">Contact Us</h3>
                <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-100">
                    {/* Line 1 */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase">Customer Care</p>
                                <p className="text-sm font-semibold text-slate-900">0806 193 4056</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openCall('08061934056')} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-200"><Phone className="w-4 h-4" /></button>
                            <button onClick={() => openWhatsApp('08061934056')} className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200"><MessageCircle className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Line 2 */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-purple-600 uppercase">Tech Support</p>
                                <p className="text-sm font-semibold text-slate-900">0704 464 7081</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openCall('07044647081')} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-200"><Phone className="w-4 h-4" /></button>
                            <button onClick={() => openWhatsApp('07044647081')} className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200"><MessageCircle className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">saukidatalinks@gmail.com</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Legal */}
            <section>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-4">Legal</h3>
                <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100">
                    <button onClick={() => setActiveSheet('legal')} className="w-full p-5 flex items-center justify-between active:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-bold text-slate-900">Terms & Privacy</h4>
                                <p className="text-xs text-slate-500">Read our legal documentation</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
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
