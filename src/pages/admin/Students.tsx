import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Search, Filter, MoreVertical, Eye } from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          enrollments (
            id,
            payment_status,
            batches (
              batch_name,
              courses (name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Students</h1>
          <p className="text-gray-mid">Manage all student records and inquiries.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
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
                <th className="p-4">Name & Contact</th>
                <th className="p-4">Qualification</th>
                <th className="p-4">Status</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-mid">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-mid">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const latestEnrollment = student.enrollments?.[0];
                  const courseName = latestEnrollment?.batches?.courses?.name || 'N/A';
                  
                  return (
                    <tr key={student.id} className="hover:bg-accent/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-navy">{student.full_name}</div>
                        <div className="text-xs text-gray-mid">{student.email}</div>
                        <div className="text-xs text-gray-mid">{student.phone}</div>
                      </td>
                      <td className="p-4 text-sm text-navy">
                        {student.highest_qualification}
                        <div className="text-xs text-gray-mid">{student.year_of_passing}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${student.enrollment_status === 'enquiry' ? 'bg-yellow-100 text-yellow-800' : 
                            student.enrollment_status === 'enrolled' ? 'bg-blue-100 text-blue-800' : 
                            student.enrollment_status === 'active' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {student.enrollment_status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-navy">
                        {courseName}
                      </td>
                      <td className="p-4 text-sm text-navy">
                        {formatDate(student.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          to={`/admin/students/${student.id}`}
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
