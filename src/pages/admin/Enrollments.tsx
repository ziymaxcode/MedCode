import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Search, Filter, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          students (id, full_name, email, phone),
          batches (batch_name, courses (name))
        `)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.students?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.batches?.batch_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Enrollments</h1>
          <p className="text-gray-mid">Manage course enrollments and payment statuses.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search student or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-light rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="p-2 border border-gray-light rounded-lg text-gray-mid hover:bg-gray-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/50 border-b border-gray-light text-sm font-medium text-gray-mid">
                <th className="p-4">Student</th>
                <th className="p-4">Course & Batch</th>
                <th className="p-4">Enrollment Date</th>
                <th className="p-4">Fee Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-mid">Loading enrollments...</td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-mid">No enrollments found.</td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <Link to={`/admin/students/${enrollment.students?.id}`} className="font-medium text-primary hover:underline">
                        {enrollment.students?.full_name}
                      </Link>
                      <div className="text-xs text-gray-mid">{enrollment.students?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-navy">{enrollment.batches?.courses?.name}</div>
                      <div className="text-xs text-gray-mid">{enrollment.batches?.batch_name}</div>
                    </td>
                    <td className="p-4 text-sm text-navy">
                      {formatDate(enrollment.enrollment_date)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-navy">{formatCurrency(enrollment.total_fee)}</div>
                      <div className="text-xs text-danger">Due: {formatCurrency(enrollment.balance_due)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${enrollment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                          enrollment.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}
                      >
                        {enrollment.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        to={`/admin/payments?enrollment=${enrollment.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md text-xs font-medium transition-colors"
                      >
                        <IndianRupee size={14} />
                        Pay
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
