import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('id');

  return (
    <div className="min-h-[80vh] bg-accent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-gray-light text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        
        <h2 className="text-3xl font-display font-bold text-navy mb-4">Application Submitted!</h2>
        
        <p className="text-gray-mid mb-8 leading-relaxed">
          Thank you for applying to MedCode Institute. Your enrollment application has been successfully received.
        </p>

        {enrollmentId && (
          <div className="bg-accent p-4 rounded-lg mb-8 border border-primary/20">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference ID</p>
            <p className="font-mono text-lg font-bold text-primary">{enrollmentId.split('-')[0].toUpperCase()}</p>
            <p className="text-xs text-gray-400 mt-2">Please save this ID for future reference.</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-mid">
            Our admissions team will review your application and contact you shortly regarding the next steps and fee payment.
          </p>
          
          <div className="pt-6 flex flex-col gap-3">
            <Link 
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Return to Home
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
