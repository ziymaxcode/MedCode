import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Printer, X, Stethoscope } from 'lucide-react';

interface ReceiptModalProps {
  payment: any;
  onClose: () => void;
}

export default function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt_${payment.receipt_number}`,
  });

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-light bg-gray-50">
          <h2 className="text-lg font-display font-bold text-navy">Payment Receipt</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-light transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-danger transition-colors rounded-md hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 bg-gray-100 flex justify-center">
          {/* Printable Area */}
          <div 
            ref={componentRef} 
            className="bg-white p-10 w-full max-w-xl shadow-sm border border-gray-200"
            style={{ minHeight: '11in' }} // Approximate A4 height
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Stethoscope size={28} />
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl text-navy leading-tight">MedCode Institute</h1>
                  <p className="text-sm text-gray-mid">Mangalore Branch</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-300 uppercase tracking-widest">Receipt</h2>
                <p className="text-sm font-mono font-bold text-navy mt-1">{payment.receipt_number}</p>
                <p className="text-sm text-gray-mid mt-1">Date: {formatDate(payment.payment_date)}</p>
              </div>
            </div>

            {/* Institute Address */}
            <div className="mb-8 text-sm text-gray-mid">
              <p>3rd Floor, Shalimar Complex</p>
              <p>Kankanady, Mangaluru, Karnataka 575002</p>
              <p>Phone: +91 80000 00000 | Email: info@medcode.edu</p>
            </div>

            {/* Student Details */}
            <div className="bg-accent/50 p-4 rounded-lg mb-8 border border-gray-light">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Received From</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-mid mb-1">Student Name</p>
                  <p className="font-bold text-navy">{payment.enrollments?.students?.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-mid mb-1">Course & Batch</p>
                  <p className="font-bold text-navy">{payment.enrollments?.batches?.batch_name}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <table className="w-full mb-8 text-sm">
              <thead>
                <tr className="border-b-2 border-gray-light text-left text-gray-mid">
                  <th className="py-3 font-medium">Description</th>
                  <th className="py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-light">
                  <td className="py-4">
                    <p className="font-medium text-navy">Course Fee Payment</p>
                    <p className="text-xs text-gray-mid mt-1">
                      Method: <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                      {payment.reference_number && ` | Ref: ${payment.reference_number}`}
                    </p>
                  </td>
                  <td className="py-4 text-right font-bold text-navy">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-16">
              <div className="w-64 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-mid">Total Fee:</span>
                  <span className="font-medium">{formatCurrency(payment.enrollments?.total_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-mid">Total Paid:</span>
                  <span className="font-medium">{formatCurrency(payment.enrollments?.amount_paid)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-light font-bold text-navy">
                  <span>Balance Due:</span>
                  <span className="text-danger">{formatCurrency(payment.enrollments?.balance_due)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-16 border-t border-gray-light">
              <div className="text-center">
                <div className="w-40 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-gray-mid">Student Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-gray-mid">Authorized Signatory</p>
                <p className="text-[10px] text-gray-400 mt-1">MedCode Institute</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-xs text-gray-400">
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p className="mt-1">Fees once paid are non-refundable.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
