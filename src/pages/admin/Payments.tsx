import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatCurrency, generateReceiptNumber } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Search, IndianRupee, Plus, FileText, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import ReceiptModal from '../../components/admin/ReceiptModal';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const enrollmentIdFromUrl = searchParams.get('enrollment');
  const { user } = useAuth();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  
  // Receipt Modal state
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchActiveEnrollments();
    
    if (enrollmentIdFromUrl) {
      handleOpenModalForEnrollment(enrollmentIdFromUrl);
    }
  }, [enrollmentIdFromUrl]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          enrollments (
            id,
            total_fee,
            amount_paid,
            balance_due,
            students (full_name),
            batches (batch_name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          total_fee,
          amount_paid,
          balance_due,
          students (full_name, phone),
          batches (batch_name)
        `)
        .gt('balance_due', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleOpenModalForEnrollment = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          total_fee,
          amount_paid,
          balance_due,
          students (full_name, phone),
          batches (batch_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setSelectedEnrollment(data);
      setAmount(data.balance_due.toString());
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching enrollment details:', error);
      toast.error('Failed to load enrollment details');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment || !amount || isNaN(Number(amount))) return;
    
    setIsSubmitting(true);
    
    try {
      const paymentAmount = Number(amount);
      if (paymentAmount <= 0 || paymentAmount > selectedEnrollment.balance_due) {
        throw new Error('Invalid payment amount');
      }

      const receiptNumber = generateReceiptNumber();
      
      // 1. Insert payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          enrollment_id: selectedEnrollment.id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          receipt_number: receiptNumber,
          recorded_by: user?.id,
          notes: notes
        });

      if (paymentError) throw paymentError;

      // 2. Update enrollment balance
      const newAmountPaid = Number(selectedEnrollment.amount_paid) + paymentAmount;
      const newBalanceDue = Number(selectedEnrollment.total_fee) - newAmountPaid;
      const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          payment_status: newStatus
        })
        .eq('id', selectedEnrollment.id);

      if (updateError) throw updateError;

      toast.success(`Payment recorded successfully. Receipt: ${receiptNumber}`);
      
      // Reset and refresh
      setIsModalOpen(false);
      setSelectedEnrollment(null);
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      fetchPayments();
      fetchActiveEnrollments();
      
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.enrollments?.students?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Payments</h1>
          <p className="text-gray-mid">Record and track student fee payments.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search receipt or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => toast.info('Razorpay integration coming soon!')}
              className="flex items-center gap-2 bg-white border border-gray-light hover:border-primary hover:text-primary text-navy px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap"
            >
              <CreditCard size={18} />
              Online Payment Link
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={18} />
              Record Payment
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/50 border-b border-gray-light text-sm font-medium text-gray-mid">
                <th className="p-4">Receipt No.</th>
                <th className="p-4">Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Method</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-mid">Loading payments...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-mid">No payments found.</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm font-bold text-primary">{payment.receipt_number}</div>
                    </td>
                    <td className="p-4 text-sm text-navy">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-navy">{payment.enrollments?.students?.full_name}</div>
                      <div className="text-xs text-gray-mid">{payment.enrollments?.batches?.batch_name}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                      {payment.reference_number && (
                        <div className="text-xs text-gray-400 mt-1">Ref: {payment.reference_number}</div>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium text-success">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedPaymentForReceipt(payment)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Receipt"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-light">
              <h2 className="text-xl font-display font-bold text-navy flex items-center gap-2">
                <IndianRupee size={24} className="text-primary" />
                Record Manual Payment
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEnrollment(null);
                }}
                className="text-gray-400 hover:text-danger transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-6">
              {!selectedEnrollment ? (
                <div>
                  <label className="block text-sm font-medium text-gray-mid mb-2">Select Student Enrollment *</label>
                  <select 
                    className="clinical-input border rounded-md px-3 bg-gray-50"
                    onChange={(e) => handleOpenModalForEnrollment(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Search and select student...</option>
                    {enrollments.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.students?.full_name} ({e.students?.phone}) - Due: {formatCurrency(e.balance_due)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="bg-accent p-4 rounded-lg border border-primary/20 mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-navy">{selectedEnrollment.students?.full_name}</p>
                        <p className="text-xs text-gray-mid">{selectedEnrollment.batches?.batch_name}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedEnrollment(null)}
                        className="text-xs text-primary hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary/10">
                      <div>
                        <p className="text-xs text-gray-mid mb-1">Total Fee</p>
                        <p className="font-medium text-navy">{formatCurrency(selectedEnrollment.total_fee)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-mid mb-1">Balance Due</p>
                        <p className="font-medium text-danger">{formatCurrency(selectedEnrollment.balance_due)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-mid mb-1">Amount (₹) *</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        max={selectedEnrollment.balance_due}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="clinical-input border-b-2" 
                        placeholder="Enter amount" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-mid mb-1">Payment Method *</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="clinical-input border-b-2 bg-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Reference Number (Optional)</label>
                    <input 
                      type="text" 
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="clinical-input border-b-2" 
                      placeholder="Transaction ID, Cheque No, etc." 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-mid mb-1">Notes (Optional)</label>
                    <input 
                      type="text" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="clinical-input border-b-2" 
                      placeholder="Any additional remarks..." 
                    />
                  </div>
                </>
              )}

              <div className="pt-6 border-t border-gray-light flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedEnrollment(null);
                  }}
                  className="px-4 py-2 text-navy font-medium hover:bg-accent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedEnrollment || isSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedPaymentForReceipt && (
        <ReceiptModal 
          payment={selectedPaymentForReceipt} 
          onClose={() => setSelectedPaymentForReceipt(null)} 
        />
      )}
    </div>
  );
}
