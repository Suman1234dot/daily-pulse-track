
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DailyWorkForm from './DailyWorkForm';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface WorkSubmission {
  id: string;
  userId: string;
  date: string;
  attendance: 'present' | 'absent';
  secondsDone?: number;
  remarks?: string;
  timestamp: string;
}

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [currentWeekSeconds, setCurrentWeekSeconds] = useState(0);
  const [currentMonthSeconds, setCurrentMonthSeconds] = useState(0);

  useEffect(() => {
    const allSubmissions = JSON.parse(localStorage.getItem('syncink_submissions') || '[]');
    const userSubmissions = allSubmissions.filter((s: WorkSubmission) => s.userId === user?.id);
    setSubmissions(userSubmissions);

    // Calculate current week and month totals
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const weekSeconds = userSubmissions
      .filter((s: WorkSubmission) => 
        new Date(s.date) >= startOfWeek && s.attendance === 'present'
      )
      .reduce((total: number, s: WorkSubmission) => total + (s.secondsDone || 0), 0);

    const monthSeconds = userSubmissions
      .filter((s: WorkSubmission) => 
        new Date(s.date) >= startOfMonth && s.attendance === 'present'
      )
      .reduce((total: number, s: WorkSubmission) => total + (s.secondsDone || 0), 0);

    setCurrentWeekSeconds(weekSeconds);
    setCurrentMonthSeconds(monthSeconds);
  }, [user?.id]);

  const formatSeconds = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const recentSubmissions = submissions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  // Chart data
  const attendanceData = [
    { name: 'Present', value: submissions.filter(s => s.attendance === 'present').length, color: '#3b82f6' },
    { name: 'Absent', value: submissions.filter(s => s.attendance === 'absent').length, color: '#ef4444' }
  ];

  const weeklyData = submissions
    .filter(s => s.attendance === 'present')
    .slice(-7)
    .map(s => ({
      date: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
      seconds: s.secondsDone || 0
    }));

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl animate-slide-down">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
              <p className="text-blue-200">Employee Dashboard</p>
            </div>
            <Button 
              onClick={logout} 
              variant="outline"
              className="glass border-blue-500/30 text-blue-100 hover:bg-blue-600/20"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card animate-scale-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {formatSeconds(currentWeekSeconds)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatSeconds(currentMonthSeconds)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {submissions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-white">Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-white">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                  <XAxis dataKey="date" stroke="#93c5fd" />
                  <YAxis stroke="#93c5fd" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 25, 40, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="seconds" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Daily Work Form */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <DailyWorkForm />
        </div>

        {/* Recent Submissions */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-white">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="text-blue-300 text-center py-4">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className="flex justify-between items-center p-4 glass rounded-xl hover:bg-blue-600/10 transition-all duration-300"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {new Date(submission.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-blue-300 capitalize">
                        {submission.attendance}
                        {submission.attendance === 'present' && submission.secondsDone && 
                          ` • ${formatSeconds(submission.secondsDone)}`
                        }
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.attendance === 'present' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {submission.attendance === 'present' ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
