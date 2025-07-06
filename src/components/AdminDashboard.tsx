
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Plus, Trash2 } from 'lucide-react';

interface WorkSubmission {
  id: string;
  userId: string;
  date: string;
  attendance: 'present' | 'absent';
  secondsDone?: number;
  remarks?: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<WorkSubmission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users] = useState<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@company.com' },
    { id: '2', name: 'John Smith', email: 'john@company.com' },
    { id: '3', name: 'Jane Doe', email: 'jane@company.com' }
  ]);

  useEffect(() => {
    const allSubmissions = JSON.parse(localStorage.getItem('syncink_submissions') || '[]');
    setSubmissions(allSubmissions);
    setFilteredSubmissions(allSubmissions);
  }, []);

  useEffect(() => {
    let filtered = [...submissions];

    if (selectedUser !== 'all') {
      filtered = filtered.filter(s => s.userId === selectedUser);
    }

    if (dateFilter) {
      filtered = filtered.filter(s => s.date === dateFilter);
    }

    setFilteredSubmissions(filtered);
  }, [selectedUser, dateFilter, submissions]);

  const formatSeconds = (seconds: number) => {
    return `${seconds}s`;
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  // Calculate weekly and monthly averages
  const getWeeklyAverage = (userId?: string) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let relevantSubmissions = submissions;
    if (userId) {
      relevantSubmissions = submissions.filter(s => s.userId === userId);
    }
    
    const weekSubmissions = relevantSubmissions.filter(s => 
      new Date(s.date) >= oneWeekAgo && s.attendance === 'present'
    );
    
    const totalSeconds = weekSubmissions.reduce((total, s) => total + (s.secondsDone || 0), 0);
    const workingDays = weekSubmissions.length;
    
    return workingDays > 0 ? Math.round(totalSeconds / workingDays) : 0;
  };

  const getMonthlyAverage = (userId?: string) => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    let relevantSubmissions = submissions;
    if (userId) {
      relevantSubmissions = submissions.filter(s => s.userId === userId);
    }
    
    const monthSubmissions = relevantSubmissions.filter(s => 
      new Date(s.date) >= oneMonthAgo && s.attendance === 'present'
    );
    
    const totalSeconds = monthSubmissions.reduce((total, s) => total + (s.secondsDone || 0), 0);
    const workingDays = monthSubmissions.length;
    
    return workingDays > 0 ? Math.round(totalSeconds / workingDays) : 0;
  };

  // Prepare chart data
  const userStats = users.map(u => {
    const userSubmissions = submissions.filter(s => s.userId === u.id);
    const totalSeconds = userSubmissions
      .filter(s => s.attendance === 'present')
      .reduce((total, s) => total + (s.secondsDone || 0), 0);
    const presentDays = userSubmissions.filter(s => s.attendance === 'present').length;
    const totalDays = userSubmissions.length;

    return {
      name: u.name,
      totalSeconds,
      presentDays,
      totalDays,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      weeklyAvg: getWeeklyAverage(u.id),
      monthlyAvg: getMonthlyAverage(u.id)
    };
  });

  const attendanceData = [
    { name: 'Present', value: submissions.filter(s => s.attendance === 'present').length, color: '#22c55e' },
    { name: 'Absent', value: submissions.filter(s => s.attendance === 'absent').length, color: '#ef4444' }
  ];

  const weeklyTrend = submissions
    .filter(s => s.attendance === 'present')
    .slice(-14)
    .reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) acc[date] = 0;
      acc[date] += curr.secondsDone || 0;
      return acc;
    }, {} as Record<string, number>);

  const trendData = Object.entries(weeklyTrend).map(([date, seconds]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    seconds
  }));

  const exportData = () => {
    const csvContent = [
      ['Date', 'User', 'Attendance', 'Seconds Done', 'Remarks'],
      ...filteredSubmissions.map(s => [
        s.date,
        getUserName(s.userId),
        s.attendance,
        s.secondsDone || 0,
        s.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syncink-tracking-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl animate-slide-down">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-blue-200">SyncInk Work Tracking Overview</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowUserManagement(!showUserManagement)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                onClick={logout} 
                variant="outline"
                className="glass border-blue-500/30 text-blue-100 hover:bg-blue-600/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        {showUserManagement && (
          <Card className="glass-card animate-slide-down">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
                <div className="grid gap-3">
                  {users.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 glass rounded-xl">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-blue-300 text-sm">{user.email}</p>
                      </div>
                      <Button size="sm" variant="destructive" className="opacity-70 hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="glass-card animate-scale-in">
          <CardHeader>
            <CardTitle className="text-white">Filters & Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="glass border-blue-500/30 text-white">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent className="glass border-blue-500/30">
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filter by date"
                  className="glass border-blue-500/30 text-white"
                />
              </div>
              <Button onClick={exportData} className="bg-green-600 hover:bg-green-700 text-white">
                Export CSV
              </Button>
            </div>
          </CardContent>
        </div>

        {/* Stats Overview with Averages */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { title: 'Total Submissions', value: filteredSubmissions.length, color: 'text-blue-400' },
            { title: 'Present Days', value: filteredSubmissions.filter(s => s.attendance === 'present').length, color: 'text-green-400' },
            { title: 'Total Work Seconds', value: formatSeconds(filteredSubmissions.filter(s => s.attendance === 'present').reduce((total, s) => total + (s.secondsDone || 0), 0)), color: 'text-purple-400' },
            { title: 'Weekly Average', value: formatSeconds(getWeeklyAverage()), color: 'text-orange-400' },
            { title: 'Monthly Average', value: formatSeconds(getMonthlyAverage()), color: 'text-pink-400' }
          ].map((stat, index) => (
            <Card key={stat.title} className="glass-card animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-200">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-white">Work Seconds by User</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                  <XAxis dataKey="name" stroke="#93c5fd" />
                  <YAxis stroke="#93c5fd" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 25, 40, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px'
                    }} 
                    formatter={(value: number) => formatSeconds(value)} 
                  />
                  <Bar dataKey="totalSeconds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-white">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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

          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-white">Work Trend (Seconds)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                  <XAxis dataKey="date" stroke="#93c5fd" />
                  <YAxis stroke="#93c5fd" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 25, 40, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px'
                    }} 
                    formatter={(value: number) => formatSeconds(value)}
                  />
                  <Line type="monotone" dataKey="seconds" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Performance Table with Averages */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-white">User Performance & Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-500/30">
                    <th className="text-left p-3 text-blue-200">User</th>
                    <th className="text-left p-3 text-blue-200">Total Seconds</th>
                    <th className="text-left p-3 text-blue-200">Present Days</th>
                    <th className="text-left p-3 text-blue-200">Weekly Avg</th>
                    <th className="text-left p-3 text-blue-200">Monthly Avg</th>
                    <th className="text-left p-3 text-blue-200">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((stat) => (
                    <tr key={stat.name} className="border-b border-blue-500/20 hover:bg-blue-600/10 transition-all duration-300">
                      <td className="p-3 text-white font-medium">{stat.name}</td>
                      <td className="p-3 text-purple-300">{formatSeconds(stat.totalSeconds)}</td>
                      <td className="p-3 text-green-300">{stat.presentDays}</td>
                      <td className="p-3 text-orange-300">{formatSeconds(stat.weeklyAvg)}</td>
                      <td className="p-3 text-pink-300">{formatSeconds(stat.monthlyAvg)}</td>
                      <td className="p-3 text-blue-300">{stat.attendanceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Submissions Table */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-white">Recent Submissions ({filteredSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-500/30">
                    <th className="text-left p-3 text-blue-200">Date</th>
                    <th className="text-left p-3 text-blue-200">User</th>
                    <th className="text-left p-3 text-blue-200">Attendance</th>
                    <th className="text-left p-3 text-blue-200">Seconds Done</th>
                    <th className="text-left p-3 text-blue-200">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((submission) => (
                    <tr key={submission.id} className="border-b border-blue-500/20 hover:bg-blue-600/10 transition-all duration-300">
                      <td className="p-3 text-white">{new Date(submission.date).toLocaleDateString()}</td>
                      <td className="p-3 text-blue-100">{getUserName(submission.userId)}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.attendance === 'present' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {submission.attendance}
                        </span>
                      </td>
                      <td className="p-3 text-blue-100">
                        {submission.secondsDone ? formatSeconds(submission.secondsDone) : '-'}
                      </td>
                      <td className="p-3 max-w-xs truncate text-blue-200">{submission.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
