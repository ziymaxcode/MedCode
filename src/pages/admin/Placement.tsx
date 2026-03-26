import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Briefcase, Building2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Placement() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          placement_status,
          placed_company,
          resume_url,
          students (full_name, phone, highest_qualification),
          batches (courses (name))
        `)
        .eq('placement_consent', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching placements:', error);
      toast.error('Failed to load placements');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: string) => {
    try {
      let placedCompany = null;
      if (newStatus === 'placed') {
        placedCompany = window.prompt('Enter the name of the company:');
        if (!placedCompany) return; // Cancelled
      }

      const { error } = await supabase
        .from('enrollments')
        .update({ 
          placement_status: newStatus,
          placed_company: placedCompany || null
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast.success('Placement status updated');
      fetchPlacements(); // Refresh data
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const columns = [
    { id: 'not_started', title: 'Not Started', color: 'bg-gray-100 border-gray-300' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'placed', title: 'Placed', color: 'bg-green-50 border-green-200' },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Placement Board</h1>
          <p className="text-gray-mid">Track student placement progress and interviews.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(column => (
            <div key={column.id} className={`w-80 flex flex-col rounded-xl border ${column.color} overflow-hidden`}>
              <div className="p-4 border-b border-inherit bg-white/50 backdrop-blur-sm flex justify-between items-center">
                <h3 className="font-display font-bold text-navy">{column.title}</h3>
                <span className="bg-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  {enrollments.filter(e => e.placement_status === column.id).length}
                </span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {loading ? (
                  <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
                ) : (
                  enrollments
                    .filter(e => e.placement_status === column.id)
                    .map(enrollment => (
                      <div key={enrollment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-light hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                        <h4 className="font-bold text-navy mb-1">{enrollment.students?.full_name}</h4>
                        <p className="text-xs text-primary font-medium mb-3">{enrollment.batches?.courses?.name}</p>
                        
                        <div className="space-y-2 text-xs text-gray-mid">
                          <div className="flex items-center gap-2">
                            <Briefcase size={14} />
                            <span className="truncate">{enrollment.students?.highest_qualification}</span>
                          </div>
                          {enrollment.placed_company && (
                            <div className="flex items-center gap-2 text-success font-medium">
                              <Building2 size={14} />
                              <span className="truncate">{enrollment.placed_company}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-light flex justify-between items-center">
                          {enrollment.resume_url ? (
                            <a 
                              href={enrollment.resume_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:text-primary-light flex items-center gap-1 transition-colors font-medium"
                            >
                              <FileText size={14} />
                              Resume
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FileText size={14} />
                              No Resume
                            </span>
                          )}
                          <select 
                            className="text-xs border border-gray-light rounded px-2 py-1 bg-gray-50 focus:outline-none focus:border-primary"
                            value={enrollment.placement_status}
                            onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="placed">Placed</option>
                          </select>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
