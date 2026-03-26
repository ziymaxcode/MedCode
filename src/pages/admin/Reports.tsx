import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data available for this report');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const val = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (val === null || val === undefined) return '""';
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateRevenueReport = async () => {
    setIsGenerating('revenue');
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          receipt_number,
          amount,
          payment_method,
          payment_date,
          reference_number,
          enrollments (
            enrollment_id,
            students (full_name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((p: any) => ({
        'Receipt Number': p.receipt_number,
        'Date': new Date(p.payment_date).toLocaleDateString(),
        'Student Name': p.enrollments?.students?.full_name || 'N/A',
        'Enrollment ID': p.enrollments?.enrollment_id || 'N/A',
        'Amount (₹)': p.amount,
        'Method': p.payment_method,
        'Reference': p.reference_number || 'N/A'
      }));

      downloadCSV(formattedData, 'Revenue_Report');
      toast.success('Revenue report generated');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const generateEnrollmentReport = async () => {
    setIsGenerating('enrollment');
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          enrollment_id,
          status,
          total_fee,
          paid_amount,
          created_at,
          students (full_name, email, phone, city),
          batches (batch_name, courses (name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((e: any) => ({
        'Enrollment ID': e.enrollment_id,
        'Date': new Date(e.created_at).toLocaleDateString(),
        'Student Name': e.students?.full_name || 'N/A',
        'Email': e.students?.email || 'N/A',
        'Phone': e.students?.phone || 'N/A',
        'City': e.students?.city || 'N/A',
        'Course': e.batches?.courses?.name || 'N/A',
        'Batch': e.batches?.batch_name || 'N/A',
        'Status': e.status,
        'Total Fee (₹)': e.total_fee,
        'Paid Amount (₹)': e.paid_amount,
        'Balance (₹)': e.total_fee - e.paid_amount
      }));

      downloadCSV(formattedData, 'Enrollment_Report');
      toast.success('Enrollment report generated');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const generatePlacementReport = async () => {
    setIsGenerating('placement');
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          placement_status,
          placed_company,
          students (full_name, email, phone, highest_qualification),
          batches (courses (name))
        `)
        .eq('placement_consent', true)
        .order('placement_status', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((e: any) => ({
        'Student Name': e.students?.full_name || 'N/A',
        'Email': e.students?.email || 'N/A',
        'Phone': e.students?.phone || 'N/A',
        'Qualification': e.students?.highest_qualification || 'N/A',
        'Course': e.batches?.courses?.name || 'N/A',
        'Status': e.placement_status.replace('_', ' ').toUpperCase(),
        'Company': e.placed_company || 'N/A'
      }));

      downloadCSV(formattedData, 'Placement_Report');
      toast.success('Placement report generated');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const reports = [
    { 
      id: 'revenue',
      title: 'Revenue Report', 
      desc: 'Monthly fee collection and pending balances', 
      icon: BarChart3,
      action: generateRevenueReport
    },
    { 
      id: 'enrollment',
      title: 'Enrollment Statistics', 
      desc: 'Student intake by course and batch', 
      icon: Calendar,
      action: generateEnrollmentReport
    },
    { 
      id: 'placement',
      title: 'Placement Record', 
      desc: 'Placed students and company details', 
      icon: Users,
      action: generatePlacementReport
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Reports & Analytics</h1>
          <p className="text-gray-mid">Generate and download detailed administrative reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="clinical-card p-6 flex flex-col">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-primary mb-4">
              <report.icon size={24} />
            </div>
            <h3 className="text-lg font-display font-bold text-navy mb-2">{report.title}</h3>
            <p className="text-sm text-gray-mid mb-6 flex-grow">{report.desc}</p>
            
            <button 
              onClick={report.action}
              disabled={isGenerating !== null}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-light hover:border-primary hover:text-primary text-navy py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {isGenerating === report.id ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
