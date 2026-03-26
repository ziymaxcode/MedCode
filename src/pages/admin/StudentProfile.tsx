import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatCurrency } from '../../lib/utils';
import { ArrowLeft, User, Mail, Phone, MapPin, GraduationCap, Briefcase, FileText, IndianRupee, Clock } from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            enrollments (
              id,
              enrollment_date,
              payment_mode,
              total_fee,
              amount_paid,
              balance_due,
              payment_status,
              placement_consent,
              placement_status,
              placed_company,
              resume_url,
              batches (
                batch_name,
                mode,
                schedule,
                start_date,
                end_date,
                courses (name, duration_weeks)
              ),
              payments (
                id,
                amount,
                payment_date,
                payment_method,
                receipt_number
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudentDetails();
  }, [id]);

  if (loading) return <div>Loading profile...</div>;
  if (!student) return <div>Student not found.</div>;

  const latestEnrollment = student.enrollments?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/students" className="p-2 border border-gray-light rounded-lg text-gray-mid hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">{student.full_name}</h1>
          <p className="text-gray-mid">Student Profile & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-light">
            <h3 className="text-lg font-display font-bold text-navy mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Personal Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-mid">Email</p>
                  <p className="text-sm font-medium text-navy">{student.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-mid">Phone</p>
                  <p className="text-sm font-medium text-navy">{student.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-mid">Location</p>
                  <p className="text-sm font-medium text-navy">{student.city} - {student.pincode}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-light">
                <p className="text-xs text-gray-mid mb-1">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                  {student.enrollment_status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-light">
            <h3 className="text-lg font-display font-bold text-navy mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-primary" />
              Academic Background
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-mid">Highest Qualification</p>
                <p className="text-sm font-medium text-navy">{student.highest_qualification}</p>
              </div>
              <div>
                <p className="text-xs text-gray-mid">College/University</p>
                <p className="text-sm font-medium text-navy">{student.college_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-mid">Year of Passing</p>
                  <p className="text-sm font-medium text-navy">{student.year_of_passing}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-mid">Background</p>
                  <p className="text-sm font-medium text-navy capitalize">{student.background_type.replace('_', ' ')}</p>
                </div>
              </div>
              {latestEnrollment?.resume_url && (
                <div className="pt-4 border-t border-gray-light">
                  <p className="text-xs text-gray-mid mb-2">Documents</p>
                  <a 
                    href={latestEnrollment.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                  >
                    <FileText size={16} />
                    View Resume / CV
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Enrollment & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {latestEnrollment ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-light border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-navy mb-1">
                      {latestEnrollment.batches?.courses?.name}
                    </h3>
                    <p className="text-sm text-gray-mid flex items-center gap-2">
                      <Briefcase size={16} />
                      Batch: {latestEnrollment.batches?.batch_name} ({latestEnrollment.batches?.mode})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-mid mb-1">Enrollment Date</p>
                    <p className="text-sm font-medium text-navy">{formatDate(latestEnrollment.enrollment_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-light mb-6">
                  <div>
                    <p className="text-xs text-gray-mid mb-1">Total Fee</p>
                    <p className="text-lg font-bold text-navy">{formatCurrency(latestEnrollment.total_fee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-mid mb-1">Amount Paid</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(latestEnrollment.amount_paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-mid mb-1">Balance Due</p>
                    <p className="text-lg font-bold text-danger">{formatCurrency(latestEnrollment.balance_due)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-mid mb-1">Payment Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${latestEnrollment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                        latestEnrollment.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {latestEnrollment.payment_status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-light transition-colors flex items-center gap-2">
                    <IndianRupee size={16} />
                    Record Payment
                  </button>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-light">
                <h3 className="text-lg font-display font-bold text-navy mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Payment History
                </h3>
                
                {latestEnrollment.payments && latestEnrollment.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-accent/50 border-b border-gray-light text-xs font-medium text-gray-mid uppercase tracking-wider">
                          <th className="p-3">Receipt No.</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Method</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-light">
                        {latestEnrollment.payments.map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-accent/30 transition-colors">
                            <td className="p-3 text-sm font-mono text-primary">{payment.receipt_number}</td>
                            <td className="p-3 text-sm text-navy">{formatDate(payment.payment_date)}</td>
                            <td className="p-3 text-sm text-navy capitalize">{payment.payment_method.replace('_', ' ')}</td>
                            <td className="p-3 text-sm font-medium text-navy text-right">{formatCurrency(payment.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-mid text-center py-4">No payments recorded yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-light text-center">
              <Clock size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-navy mb-2">No Active Enrollments</h3>
              <p className="text-gray-mid mb-6">This student has not enrolled in any courses yet.</p>
              <button className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-light transition-colors">
                Create Enrollment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
