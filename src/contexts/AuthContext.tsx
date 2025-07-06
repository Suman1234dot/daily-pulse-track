
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role: 'employee' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
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

// Function to get current users from localStorage
const getCurrentUsers = () => {
  const storedUsers = localStorage.getItem('syncink_users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  // Default users if none exist
  const defaultUsers: User[] = [
    {
      id: '1',
      email: 'admin@company.com',
      role: 'admin',
      name: 'Admin User'
    },
    {
      id: '2',
      email: 'john@company.com',
      role: 'employee',
      name: 'John Smith'
    },
    {
      id: '3',
      email: 'jane@company.com',
      role: 'employee',
      name: 'Jane Doe'
    }
  ];
  
  localStorage.setItem('syncink_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session (both regular and remember me)
    const storedUser = localStorage.getItem('syncink_user') || sessionStorage.getItem('syncink_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    // Get current users from localStorage
    const currentUsers = getCurrentUsers();
    const foundUser = currentUsers.find((u: User) => u.email === email);
    
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      
      // Store based on remember me preference
      if (rememberMe) {
        localStorage.setItem('syncink_user', JSON.stringify(foundUser));
        // Remove from session storage if exists
        sessionStorage.removeItem('syncink_user');
      } else {
        sessionStorage.setItem('syncink_user', JSON.stringify(foundUser));
        // Remove from local storage if exists
        localStorage.removeItem('syncink_user');
      }
      
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
    localStorage.removeItem('syncink_user');
    sessionStorage.removeItem('syncink_user');
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
