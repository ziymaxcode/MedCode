import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Stethoscope, BookOpen, Award, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-accent overflow-hidden">
        <div className="absolute inset-0 bg-hex-pattern opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Admissions Open for 2026
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-navy leading-tight mb-6">
                Launch Your Career in <span className="text-primary">Healthcare Administration</span>
              </h1>
              <p className="text-lg text-gray-mid mb-8 max-w-lg leading-relaxed">
                Join Mangalore's premier institute for Medical Coding, Billing, and Transcription. Expert-led training with 100% placement assistance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/enroll" className="bg-primary hover:bg-primary-light text-white px-8 py-3.5 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                  Start Enrollment
                  <ArrowRight size={18} />
                </Link>
                <Link to="/courses" className="bg-white border-2 border-gray-light hover:border-primary text-navy px-8 py-3.5 rounded-full font-medium transition-colors">
                  View Courses
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3 scale-105"></div>
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
                alt="Medical students studying" 
                className="rounded-3xl shadow-2xl relative z-10 object-cover h-[500px] w-full"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-4 border-l-4 border-gold">
                <div className="bg-gold/10 p-3 rounded-full text-gold">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-mid font-medium uppercase tracking-wider">Certification</p>
                  <p className="font-display font-bold text-navy">AAPC Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-navy mb-4">Why Choose Cardea?</h2>
            <p className="text-gray-mid">We provide comprehensive training designed to meet the rigorous standards of the global healthcare industry.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Industry-Aligned Curriculum",
                desc: "Learn ICD-10, CPT, and HCPCS coding guidelines updated for the current year."
              },
              {
                icon: Stethoscope,
                title: "Expert Faculty",
                desc: "Train under AAPC certified professionals with years of real-world clinical experience."
              },
              {
                icon: Users,
                title: "Placement Assistance",
                desc: "Dedicated placement cell connecting you with top healthcare providers and RCM companies."
              }
            ].map((feature, i) => (
              <div key={i} className="clinical-card p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-primary mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-display font-bold text-navy mb-3">{feature.title}</h3>
                <p className="text-gray-mid leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
