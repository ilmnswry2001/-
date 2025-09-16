import React from 'react';
import { Book, BookFile } from '../types';
import Icon from './Icon';

interface BookItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onOpenFilePreview: (file: BookFile) => void;
}

const BookItem: React.FC<BookItemProps> = ({ book, onEdit, onDelete, onOpenFilePreview }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-5 border-r-4 border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{book.title}</h3>
          <p className="text-sm text-gray-400">رقم الكتاب: {book.number}</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button onClick={() => onEdit(book)} className="text-gray-400 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700 transition">
            <Icon name="edit" className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(book.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-700 transition">
            <Icon name="delete" className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-300 mb-2"><strong>الموضوع:</strong> {book.subject}</p>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <p><strong>الجهة:</strong> {book.entity}</p>
          <p><strong>التاريخ:</strong> {book.date}</p>
        </div>
        {book.file && (
          <div className="mt-4">
            <button
              onClick={() => onOpenFilePreview(book.file!)}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold text-sm"
            >
              <Icon name="file" className="w-5 h-5 ml-2" />
              <span>عرض الملف المرفق ({book.file.name})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookItem;