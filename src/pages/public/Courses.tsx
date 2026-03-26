import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { Clock, IndianRupee, BookOpen, ArrowRight } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (data) setCourses(data);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading courses...</div>;
  }

  return (
    <div className="bg-accent min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-display font-bold text-navy mb-4">Our Training Programs</h1>
          <p className="text-gray-mid text-lg">Comprehensive courses designed to launch your career in healthcare administration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="clinical-card flex flex-col h-full hover:shadow-lg transition-shadow bg-white">
              <div className="p-6 flex-grow">
                <div className="inline-block px-3 py-1 bg-accent text-primary text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                  {course.category}
                </div>
                <h3 className="text-xl font-display font-bold text-navy mb-3">{course.name}</h3>
                <p className="text-gray-mid text-sm mb-6 line-clamp-3">{course.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-navy">
                    <Clock size={16} className="text-primary mr-3" />
                    <span className="font-medium">{course.duration_weeks} Weeks</span>
                  </div>
                  <div className="flex items-center text-sm text-navy">
                    <IndianRupee size={16} className="text-primary mr-3" />
                    <span className="font-medium">{formatCurrency(course.fee_full)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-light bg-gray-50 mt-auto">
                <Link 
                  to={`/enroll?course=${course.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-primary text-primary hover:bg-primary hover:text-white py-2.5 rounded-md font-medium transition-colors"
                >
                  Enroll Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
