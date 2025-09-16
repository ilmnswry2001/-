import React from 'react';
import { Book, BookFile } from '../types';
import BookItem from './BookItem';

interface BookListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onOpenFilePreview: (file: BookFile) => void;
}

const BookList: React.FC<BookListProps> = ({ books, onEdit, onDelete, onOpenFilePreview }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 text-lg">لا توجد كتب لعرضها. حاول تغيير بحثك أو إضافة كتاب جديد.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      {books.map(book => (
        <BookItem key={book.id} book={book} onEdit={onEdit} onDelete={onDelete} onOpenFilePreview={onOpenFilePreview} />
      ))}
    </div>
  );
};

export default BookList;