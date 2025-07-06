
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await login(email, password, rememberMe);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-blue-800/20"></div>
      <Card className="w-full max-w-md glass-card animate-scale-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/66c22aac-7617-47a5-84a1-af4721b3a990.png" 
              alt="SyncInk Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-white">SyncInk Tracker</CardTitle>
          <CardDescription className="text-blue-200">
            Sign in to track your daily work progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-100">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-100">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="border-blue-500/30 data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="remember" className="text-blue-100 text-sm">
                Remember me
              </Label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-8 p-4 glass rounded-xl text-sm">
            <p className="font-semibold mb-3 text-blue-200">Demo Credentials:</p>
            <p className="text-blue-100"><strong>Admin:</strong> admin@company.com / password123</p>
            <p className="text-blue-100"><strong>Employee:</strong> john@company.com / password123</p>
            <p className="text-blue-100"><strong>Employee:</strong> jane@company.com / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
