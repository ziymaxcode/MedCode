import React, { useEffect, useState } from 'react';
import { supabase, MANGALORE_BRANCH_ID } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Plus, Search, Users, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Batches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    course_id: '',
    batch_name: '',
    start_date: '',
    end_date: '',
    schedule: 'weekend',
    mode: 'offline',
    max_seats: 30,
    is_active: true,
  });

  useEffect(() => {
    fetchBatches();
    fetchCourses();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          courses (name)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .eq('is_active', true);
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('batches')
        .insert([{
          ...formData,
          branch_id: MANGALORE_BRANCH_ID,
          enrolled_count: 0
        }]);

      if (error) throw error;

      toast.success('Batch created successfully');
      setIsModalOpen(false);
      fetchBatches(); // Refresh list
      
      // Reset form
      setFormData({
        course_id: '',
        batch_name: '',
        start_date: '',
        end_date: '',
        schedule: 'weekend',
        mode: 'offline',
        max_seats: 30,
        is_active: true,
      });
    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Batches</h1>
          <p className="text-gray-mid">Manage training batches and schedules.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus size={18} />
          New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-mid">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-mid">No batches found.</div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="clinical-card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="inline-block px-2.5 py-1 bg-accent text-primary text-xs font-bold rounded uppercase tracking-wider">
                  {batch.mode} • {batch.schedule}
                </div>
                <span className={`w-2 h-2 rounded-full ${batch.is_active ? 'bg-success' : 'bg-gray-400'}`} title={batch.is_active ? 'Active' : 'Inactive'}></span>
              </div>
              
              <h3 className="text-xl font-display font-bold text-navy mb-1">{batch.batch_name}</h3>
              <p className="text-sm text-gray-mid mb-4 line-clamp-1">{batch.courses?.name}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Start Date</p>
                  <p className="font-medium text-navy">{formatDate(batch.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">End Date</p>
                  <p className="font-medium text-navy">{formatDate(batch.end_date)}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-light flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-mid">
                  <Users size={16} />
                  <span><strong className="text-navy">{batch.enrolled_count}</strong> / {batch.max_seats} Enrolled</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-24 h-2 bg-gray-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min(100, (batch.enrolled_count / batch.max_seats) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-light sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-display font-bold text-navy">Create New Batch</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-navy transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">Course *</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                    className="clinical-input w-full"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">Batch Name *</label>
                  <input
                    type="text"
                    name="batch_name"
                    value={formData.batch_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. MANG-MC-2024-01"
                    className="clinical-input w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="clinical-input w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="clinical-input w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">Schedule *</label>
                  <select
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    required
                    className="clinical-input w-full"
                  >
                    <option value="weekday">Weekday</option>
                    <option value="weekend">Weekend</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">Mode *</label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    required
                    className="clinical-input w-full"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy">Max Seats *</label>
                  <input
                    type="number"
                    name="max_seats"
                    value={formData.max_seats}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="clinical-input w-full"
                  />
                </div>

                <div className="space-y-2 flex items-center mt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-navy">Active Batch</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-light">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-mid hover:text-navy font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
