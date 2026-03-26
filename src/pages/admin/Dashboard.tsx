import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';
import { Users, GraduationCap, IndianRupee, Briefcase, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeBatches: 0,
    revenue: 0,
    pendingBalance: 0,
    placedStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total students
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Fetch active batches
        const { count: batchCount } = await supabase
          .from('batches')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch revenue (sum of all payments)
        const { data: payments } = await supabase
          .from('payments')
          .select('amount');
        const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Fetch pending balance
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('balance_due');
        const totalPending = enrollments?.reduce((sum, e) => sum + Number(e.balance_due), 0) || 0;

        // Fetch placed students
        const { count: placedCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('placement_status', 'placed');

        setStats({
          totalStudents: studentCount || 0,
          activeBatches: batchCount || 0,
          revenue: totalRevenue,
          pendingBalance: totalPending,
          placedStudents: placedCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const kpiCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Batches', value: stats.activeBatches, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Revenue Collected', value: formatCurrency(stats.revenue), icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Pending Balance', value: formatCurrency(stats.pendingBalance), icon: TrendingUp, color: 'text-danger', bg: 'bg-danger/10' },
    { title: 'Students Placed', value: stats.placedStudents, icon: Briefcase, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  // Placeholder data for charts
  const monthlyData = [
    { name: 'Jan', enrollments: 12 },
    { name: 'Feb', enrollments: 19 },
    { name: 'Mar', enrollments: 15 },
    { name: 'Apr', enrollments: 22 },
    { name: 'May', enrollments: 28 },
    { name: 'Jun', enrollments: 35 },
  ];

  const courseData = [
    { name: 'Medical Coding', value: 45 },
    { name: 'Medical Billing', value: 25 },
    { name: 'Transcription', value: 15 },
    { name: 'CPC Prep', value: 15 },
  ];
  const COLORS = ['#0A6E6E', '#12AAAA', '#C5972F', '#0D2B45'];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy">Dashboard Overview</h1>
        <p className="text-gray-mid">Welcome back to the MedCode Admin Portal.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-light flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-mid mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-navy">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-light">
          <h3 className="text-lg font-display font-bold text-navy mb-6">Enrollment Trends (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8ECEF" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7B8D', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7B8D', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#E8ECEF', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="enrollments" stroke="#0A6E6E" strokeWidth={3} dot={{ r: 4, fill: '#0A6E6E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-light">
          <h3 className="text-lg font-display font-bold text-navy mb-6">Enrollment by Course</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-3">
              {courseData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-mid">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
