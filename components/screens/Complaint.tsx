
import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { MessageSquareWarning, MessageCircle, Headphones, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from '../../lib/toast';

interface ComplaintProps {
    onBack?: () => void;
}

export const Complaint: React.FC<ComplaintProps> = ({ onBack }) => {
  const [form, setForm] = useState({ phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
      if (!form.phone || !form.message) return toast.error("Please fill all fields");
      setIsSubmitting(true);
      try {
          await fetch('/api/support', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(form)
          });
          setSubmitted(true);
      } catch (e) {
          toast.error("Failed to send complaint");
      } finally {
          setIsSubmitting(false);
      }
  };

  const openWhatsApp = () => {
      window.open(`https://wa.me/2348061934056?text=Hello Sauki Mart, I have an issue: ${encodeURIComponent(form.message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* iOS Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 pt-12 pb-4 sticky top-0 z-10 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 active:scale-95 transition-transform">
                <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Support Center</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Resolve Issues</p>
          </div>
      </div>

      <div className="p-6">
      {!submitted ? (
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-900">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-slate-900">How can we help?</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Experiencing transaction delays or delivery issues? Lodge a formal complaint below.</p>
              </div>

              <div className="space-y-4">
                  <Input label="Your Phone Number" placeholder="080..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-white shadow-sm" />
                  <div className="space-y-2 w-full group">
                      <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">Issue Description</label>
                      <textarea 
                        className="flex w-full rounded-2xl bg-white px-5 py-4 text-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px] shadow-sm border-none resize-none font-medium text-slate-900 transition-all duration-300" 
                        placeholder="Describe your issue in detail..."
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                      />
                  </div>
                  <Button onClick={handleSubmit} isLoading={isSubmitting} className="h-16 bg-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200 mt-2">
                      Submit Ticket
                  </Button>
              </div>
          </div>
      ) : (
          <div className="text-center py-10 space-y-6">
               <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200 animate-in zoom-in">
                   <CheckCircle className="w-12 h-12 text-white" />
               </div>
               <div>
                   <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Ticket Open</h2>
                   <p className="text-slate-500 font-medium text-sm mt-2">Support team has been notified.</p>
               </div>
               
               <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                   <h4 className="flex items-center justify-center gap-2 text-amber-800 font-black uppercase tracking-tight mb-2">
                       <AlertTriangle className="w-5 h-5" /> Need Urgent Help?
                   </h4>
                   <p className="text-xs font-bold text-amber-700 mb-6">If this is an emergency, contact us directly on WhatsApp with your Ticket ID.</p>
                   <Button onClick={openWhatsApp} className="h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl uppercase font-black shadow-lg shadow-green-100 w-full">
                       <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
                   </Button>
               </div>
               
               <Button variant="ghost" onClick={() => setSubmitted(false)}>Open New Ticket</Button>
          </div>
      )}
      </div>
    </div>
  );
};
