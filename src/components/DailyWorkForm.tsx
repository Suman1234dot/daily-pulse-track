
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WorkSubmission {
  id: string;
  userId: string;
  date: string;
  attendance: 'present' | 'absent';
  secondsDone?: number;
  remarks?: string;
  timestamp: string;
}

const DailyWorkForm = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<'present' | 'absent' | ''>('');
  const [secondsDone, setSecondsDone] = useState('');
  const [remarks, setRemarks] = useState('');
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check if user has already submitted today
    const submissions = JSON.parse(localStorage.getItem('syncink_submissions') || '[]');
    const todaySubmission = submissions.find((s: WorkSubmission) => 
      s.userId === user?.id && s.date === today
    );
    
    if (todaySubmission) {
      setHasSubmittedToday(true);
      setAttendance(todaySubmission.attendance);
      setSecondsDone(todaySubmission.secondsDone?.toString() || '');
      setRemarks(todaySubmission.remarks || '');
    }
  }, [user?.id, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attendance) {
      toast({
        title: "Error",
        description: "Please select attendance status",
        variant: "destructive",
      });
      return;
    }

    if (attendance === 'present' && !secondsDone) {
      toast({
        title: "Error",
        description: "Please enter seconds done",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const submission: WorkSubmission = {
      id: Date.now().toString(),
      userId: user!.id,
      date: today,
      attendance: attendance as 'present' | 'absent',
      secondsDone: attendance === 'present' ? parseInt(secondsDone) : undefined,
      remarks: attendance === 'present' ? remarks : undefined,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage (in real app, this would be Supabase)
    const submissions = JSON.parse(localStorage.getItem('syncink_submissions') || '[]');
    const existingIndex = submissions.findIndex((s: WorkSubmission) => 
      s.userId === user?.id && s.date === today
    );

    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }

    localStorage.setItem('syncink_submissions', JSON.stringify(submissions));
    
    setHasSubmittedToday(true);
    toast({
      title: "Success",
      description: hasSubmittedToday ? "Work entry updated successfully!" : "Work entry submitted successfully!",
    });
    
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card animate-slide-up">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Kaam Kitna Kiya?
        </CardTitle>
        <p className="text-center text-sm text-blue-200">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="attendance" className="text-blue-100">Attendance Status</Label>
            <Select
              value={attendance}
              onValueChange={(value) => {
                setAttendance(value as 'present' | 'absent');
                if (value === 'absent') {
                  setSecondsDone('');
                  setRemarks('');
                }
              }}
              disabled={hasSubmittedToday}
            >
              <SelectTrigger className="glass border-blue-500/30 text-white">
                <SelectValue placeholder="Select attendance" />
              </SelectTrigger>
              <SelectContent className="glass border-blue-500/30">
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {attendance === 'present' && (
            <div className="space-y-6 animate-slide-down">
              <div className="space-y-2">
                <Label htmlFor="secondsDone" className="text-blue-100">Seconds Done</Label>
                <Input
                  id="secondsDone"
                  type="number"
                  placeholder="Enter seconds completed"
                  value={secondsDone}
                  onChange={(e) => setSecondsDone(e.target.value)}
                  disabled={hasSubmittedToday}
                  min="0"
                  className="glass border-blue-500/30 text-white placeholder-blue-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-blue-100">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="Any additional notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={hasSubmittedToday}
                  rows={3}
                  className="glass border-blue-500/30 text-white placeholder-blue-300/50"
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            disabled={isSubmitting || hasSubmittedToday}
          >
            {isSubmitting ? 'Submitting...' : hasSubmittedToday ? 'Already Submitted Today' : 'Submit Work Entry'}
          </Button>

          {hasSubmittedToday && (
            <p className="text-sm text-green-400 text-center animate-fade-in">
              ✓ You have successfully submitted your work entry for today
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DailyWorkForm;
