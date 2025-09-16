import React, { useState } from 'react';
import { User } from '../types';
import Icon from './Icon';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: Omit<User, 'id' | 'role'>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAddUser, onDeleteUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert('الرجاء إدخال اسم مستخدم وكلمة مرور.');
      return;
    }
    setIsSubmitting(true);
    await onAddUser({ username: newUsername, password: newPassword });
    setNewUsername('');
    setNewPassword('');
    setIsSubmitting(false);
  };

  const inputStyles = "w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";


  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">إدارة المستخدمين</h2>

      {/* Add User Form */}
      <div className="mb-8 bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">إضافة مستخدم جديد</h3>
        <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="newUsername">اسم المستخدم</label>
            <input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className={inputStyles}
              placeholder="اسم المستخدم الجديد"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="newPassword">كلمة المرور</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputStyles}
              placeholder="كلمة مرور قوية"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 h-10 flex items-center justify-center disabled:bg-gray-500"
          >
            <Icon name="add" className="w-5 h-5 ml-2"/>
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة مستخدم'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">قائمة المستخدمين الحاليين</h3>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{user.username}</p>
                <p className={`text-sm font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    user.role === 'admin' 
                    ? 'bg-green-600 text-green-100'
                    : 'bg-yellow-600 text-yellow-100'
                }`}>
                  {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                </p>
              </div>
              {user.id !== currentUser.id && ( // Prevent admin from deleting themselves
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-600 transition"
                  aria-label={`حذف المستخدم ${user.username}`}
                >
                  <Icon name="delete" className="w-5 h-5"/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
