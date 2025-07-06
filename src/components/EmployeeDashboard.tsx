
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DailyWorkForm from './DailyWorkForm';

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
    const allSubmissions = JSON.parse(localStorage.getItem('worktrack_submissions') || '[]');
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Employee Dashboard</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatSeconds(currentWeekSeconds)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatSeconds(currentMonthSeconds)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {submissions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Work Form */}
        <DailyWorkForm />

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(submission.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {submission.attendance}
                        {submission.attendance === 'present' && submission.secondsDone && 
                          ` • ${formatSeconds(submission.secondsDone)}`
                        }
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission.attendance === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
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
