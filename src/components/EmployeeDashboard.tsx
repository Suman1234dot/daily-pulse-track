
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DailyWorkForm from './DailyWorkForm';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Daily Work Form */}
        <div className="animate-slide-up">
          <DailyWorkForm />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
