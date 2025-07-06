
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
}

interface UserManagementProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUsersChange }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee' as 'employee' | 'admin'
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    if (users.some(user => user.email === newUser.email)) {
      toast({
        title: "Error",
        description: "User with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    const updatedUsers = [...users, user];
    onUsersChange(updatedUsers);

    // Reset form
    setNewUser({ name: '', email: '', role: 'employee' });
    setIsAddDialogOpen(false);

    toast({
      title: "Success",
      description: `User ${user.name} has been added`,
    });
  };

  const handleRemoveUser = (userId: string) => {
    const userToRemove = users.find(user => user.id === userId);
    if (!userToRemove) return;

    // Prevent removing the last admin
    const adminUsers = users.filter(user => user.role === 'admin');
    if (userToRemove.role === 'admin' && adminUsers.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot remove the last admin user",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.filter(user => user.id !== userId);
    onUsersChange(updatedUsers);

    toast({
      title: "Success",
      description: `User ${userToRemove.name} has been removed`,
    });
  };

  return (
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-blue-500/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Name</label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter user name"
                      className="glass border-blue-500/30 text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter user email"
                      className="glass border-blue-500/30 text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Role</label>
                    <Select value={newUser.role} onValueChange={(value: 'employee' | 'admin') => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="glass border-blue-500/30 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-blue-500/30">
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="glass border-blue-500/30 text-blue-100 hover:bg-blue-600/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddUser}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Add User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center p-3 glass rounded-xl">
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-blue-300 text-sm">{user.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="opacity-70 hover:opacity-100"
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
