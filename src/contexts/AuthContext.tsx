
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  mobile?: string;
  role: 'employee' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrMobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo - in real app this would be from Supabase
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    mobile: '9876543210',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'john@company.com',
    mobile: '9876543211',
    role: 'employee',
    name: 'John Smith'
  },
  {
    id: '3',
    email: 'jane@company.com',
    mobile: '9876543212',
    role: 'employee',
    name: 'Jane Doe'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('worktrack_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrMobile: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication - in real app this would be Supabase auth
    const foundUser = mockUsers.find(u => 
      u.email === emailOrMobile || u.mobile === emailOrMobile
    );
    
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('worktrack_user', JSON.stringify(foundUser));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      setIsLoading(false);
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try password123",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('worktrack_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
