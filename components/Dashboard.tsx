import React, { useMemo } from 'react';
import { Book, BookFile, BookType } from '../types';
import Icon from './Icon';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  books: Book[];
  onOpenFilePreview: (file: BookFile) => void;
}

const RADIAN = Math.PI / 180;
// FIX: The type for the label renderer from recharts is not complete. Using `any` to avoid compilation errors.
// The props object contains calculated properties like `midAngle` and `percent` which are not in the official `PieLabelRenderProps` type.
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const radius = outerRadius * 1.2; // Position label outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#E5E7EB"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-semibold text-sm"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ books, onOpenFilePreview }) => {
  const stats = useMemo(() => {
    const incoming = books.filter(b => b.type === BookType.INCOMING).length;
    const outgoing = books.filter(b => b.type === BookType.OUTGOING).length;
    return {
      total: books.length,
      incoming,
      outgoing,
    };
  }, [books]);

  const recentBooksWithFiles = useMemo(() => {
    return books
      .filter(book => !!book.file)
      .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Assuming ID is timestamp from Date.now()
      .slice(0, 5);
  }, [books]);

  const pieData = [
    { name: 'كتب واردة', value: stats.incoming },
    { name: 'كتب صادرة', value: stats.outgoing },
  ];

  const COLORS = ['#3B82F6', '#10B981'];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">لوحة الإحصائيات</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-700 p-6 rounded-lg flex items-center">
          <div className="bg-blue-600 text-white rounded-full p-3 mr-4">
            <Icon name="file" className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-gray-400 text-lg">مجموع الكتب</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg flex items-center">
          <div className="bg-sky-600 text-white rounded-full p-3 mr-4">
            <Icon name="inbox" className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-gray-400 text-lg">الكتب الواردة</p>
            <p className="text-3xl font-bold text-white">{stats.incoming}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg flex items-center">
          <div className="bg-emerald-600 text-white rounded-full p-3 mr-4">
            <Icon name="outbox" className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-gray-400 text-lg">الكتب الصادرة</p>
            <p className="text-3xl font-bold text-white">{stats.outgoing}</p>
          </div>
        </div>
      </div>
      
      <div className="h-96 mb-12">
        <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">توزيع الكتب</h3>
        {stats.total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.5rem' }} 
                formatter={(value: number) => [`${value} كتاب`, '']} 
              />
              <Legend wrapperStyle={{ color: '#E5E7EB', paddingTop: '20px' }}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            لا توجد بيانات لعرض الرسم البياني.
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-4">ملفات مضافة مؤخراً</h3>
        {recentBooksWithFiles.length > 0 ? (
          <div className="space-y-3">
            {recentBooksWithFiles.map(book => (
              <div key={book.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center transition hover:bg-gray-600">
                <div>
                  <p className="font-bold text-white">{book.title}</p>
                  <p className="text-sm text-gray-400">{book.file?.name}</p>
                </div>
                <button 
                  onClick={() => onOpenFilePreview(book.file!)}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold text-sm"
                >
                  <Icon name="file" className="w-5 h-5 ml-2" />
                  <span>عرض</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-700 rounded-lg">
            <p className="text-gray-400">لم يتم إرفاق ملفات مع أي كتب بعد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
