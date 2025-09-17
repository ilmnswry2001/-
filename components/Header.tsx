import React from 'react';
import Icon from './Icon';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onAddBook: () => void;
  onLogout: () => void;
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onAddBook, onLogout, currentUser }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'لوحة الإحصائيات', icon: 'dashboard' as const, adminOnly: false },
    { view: View.INCOMING, label: 'الكتب الواردة', icon: 'inbox' as const, adminOnly: false },
    { view: View.OUTGOING, label: 'الكتب الصادرة', icon: 'outbox' as const, adminOnly: false },
    { view: View.BARCODE_GENERATOR, label: 'مولّد الباركود', icon: 'barcode' as const, adminOnly: false },
    { view: View.USER_MANAGEMENT, label: 'إدارة المستخدمين', icon: 'users' as const, adminOnly: true },
  ];

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-gray-800 text-gray-200 shadow-xl flex flex-col z-20">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center">أرشيف الكتب</h1>
        <p className="text-center text-sm text-blue-300 mt-1">مرحباً, {currentUser.username}</p>
      </div>
      
      <nav className="flex-grow p-4">
        {navItems.map(item => {
          if (item.adminOnly && currentUser.role !== 'admin') {
            return null;
          }
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex items-center w-full px-4 py-3 my-1 rounded-lg font-semibold transition-colors duration-200 ${
                currentView === item.view
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5 ml-3" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-3">
        <button
          onClick={onAddBook}
          className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors duration-200"
        >
          <Icon name="add" className="w-5 h-5 ml-2" />
          <span>إضافة كتاب جديد</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center hover:bg-red-700 transition-colors duration-200"
        >
          <Icon name="logout" className="w-5 h-5 ml-2" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;