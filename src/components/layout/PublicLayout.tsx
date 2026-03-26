import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Stethoscope, BookOpen, UserPlus, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-light bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden p-1 bg-white shadow-sm flex items-center justify-center">
    <img src="/logo.png" alt="Cardea Logo" />
  </div>

  <div className="leading-tight">
    <h1 className="font-display font-bold text-lg sm:text-xl text-navy">
      Cardea
    </h1>
    <p className="text-[10px] sm:text-xs text-primary font-medium tracking-wider uppercase">
      Mangalore Branch
    </p>
  </div>
</Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/courses" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === '/courses' ? "text-primary" : "text-navy"
                )}
              >
                Our Courses
              </Link>
              <Link 
                to="/enroll" 
                className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              >
                Enroll Now
                <ChevronRight size={16} />
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-navy text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center overflow-hidden">
  <img 
    src="/logo.png" 
    alt="Cardea Logo" 
    className="w-full h-full object-contain"
  />
</div>
              <h2 className="font-display font-bold text-lg">Cardea Institute</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premier medical coding and billing training institute. Preparing the next generation of healthcare administration professionals.
            </p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Mangalore Branch</h3>
            <address className="text-gray-400 text-sm not-italic leading-relaxed">
              3rd Floor, Shalimar Complex<br />
              Kankanady, Mangaluru<br />
              Karnataka 575002
            </address>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link to="/enroll" className="hover:text-white transition-colors">Enrollment</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition-colors">Staff Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Cardea Healthcare Solutions Institute. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
