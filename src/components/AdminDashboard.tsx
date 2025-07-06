
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  const [users] = useState<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@company.com' },
    { id: '2', name: 'John Smith', email: 'john@company.com' },
    { id: '3', name: 'Jane Doe', email: 'jane@company.com' }
  ]);

  useEffect(() => {
    const allSubmissions = JSON.parse(localStorage.getItem('worktrack_submissions') || '[]');
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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
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
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    };
  });

  const attendanceData = [
    { name: 'Present', value: submissions.filter(s => s.attendance === 'present').length },
    { name: 'Absent', value: submissions.filter(s => s.attendance === 'absent').length }
  ];

  const COLORS = ['#22c55e', '#ef4444'];

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
    a.download = 'work-tracking-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Work Tracking Overview</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
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
                />
              </div>
              <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {filteredSubmissions.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredSubmissions.filter(s => s.attendance === 'present').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Seconds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatSeconds(
                  filteredSubmissions
                    .filter(s => s.attendance === 'present')
                    .reduce((total, s) => total + (s.secondsDone || 0), 0)
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {filteredSubmissions.length > 0 
                  ? Math.round((filteredSubmissions.filter(s => s.attendance === 'present').length / filteredSubmissions.length) * 100)
                  : 0
                }%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Hours by User</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatSeconds(value)} />
                  <Bar dataKey="totalSeconds" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions ({filteredSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Attendance</th>
                    <th className="text-left p-2">Seconds Done</th>
                    <th className="text-left p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((submission) => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(submission.date).toLocaleDateString()}</td>
                      <td className="p-2">{getUserName(submission.userId)}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          submission.attendance === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.attendance}
                        </span>
                      </td>
                      <td className="p-2">
                        {submission.secondsDone ? formatSeconds(submission.secondsDone) : '-'}
                      </td>
                      <td className="p-2 max-w-xs truncate">{submission.remarks || '-'}</td>
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
