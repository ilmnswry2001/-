import React, { useState, useMemo, useCallback } from 'react';
import { Book, BookFile, BookType, View } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Header';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import SearchBar from './components/SearchBar';
import Modal from './components/Modal';
import BookForm from './components/BookForm';

function App() {
  const [books, setBooks] = useLocalStorage<Book[]>('books', []);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<BookFile | null>(null);

  const handleAddBookClick = () => {
    setBookToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditBookClick = (book: Book) => {
    setBookToEdit(book);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setBookToEdit(null);
  };
  
  const handleOpenFilePreview = (file: BookFile) => {
    setFileToPreview(file);
    setIsFilePreviewOpen(true);
  };

  const handleCloseFilePreview = () => {
    setIsFilePreviewOpen(false);
    setFileToPreview(null);
  };


  const handleSaveBook = useCallback((bookData: Omit<Book, 'id'> | Book) => {
    if ('id' in bookData && bookData.id) { // Editing existing book
      setBooks(prevBooks => prevBooks.map(b => b.id === bookData.id ? bookData as Book : b));
    } else { // Adding new book
      const newBook = { ...bookData, id: Date.now().toString() } as Book;
      setBooks(prevBooks => [...prevBooks, newBook]);
    }
  }, [setBooks]);

  const handleDeleteBook = useCallback((bookId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الكتاب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
    }
  }, [setBooks]);

  const filteredBooks = useMemo(() => {
    let booksToShow = books;

    if (currentView === View.INCOMING) {
      booksToShow = books.filter(b => b.type === BookType.INCOMING);
    } else if (currentView === View.OUTGOING) {
      booksToShow = books.filter(b => b.type === BookType.OUTGOING);
    }
    
    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        return booksToShow.filter(book => 
            book.title.toLowerCase().includes(lowercasedTerm) ||
            book.number.toLowerCase().includes(lowercasedTerm) ||
            book.entity.toLowerCase().includes(lowercasedTerm) ||
            book.subject.toLowerCase().includes(lowercasedTerm) ||
            book.date.includes(lowercasedTerm)
        );
    }

    return booksToShow;
  }, [books, currentView, searchTerm]);

  const getViewTitle = () => {
    switch (currentView) {
      case View.INCOMING:
        return 'قائمة الكتب الواردة';
      case View.OUTGOING:
        return 'قائمة الكتب الصادرة';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onAddBook={handleAddBookClick}
      />

      <main className="mr-64 p-4 sm:p-8">
        {currentView === View.DASHBOARD ? (
          <Dashboard books={books} onOpenFilePreview={handleOpenFilePreview} />
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">{getViewTitle()}</h2>
            <div className="mb-6">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            <BookList books={filteredBooks} onEdit={handleEditBookClick} onDelete={handleDeleteBook} onOpenFilePreview={handleOpenFilePreview} />
          </div>
        )}
      </main>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={bookToEdit ? 'تعديل كتاب' : 'إضافة كتاب جديد'}
      >
        <BookForm
          bookToEdit={bookToEdit}
          onSave={handleSaveBook}
          onClose={handleCloseForm}
        />
      </Modal>

      <Modal
        isOpen={isFilePreviewOpen}
        onClose={handleCloseFilePreview}
        title={fileToPreview?.name || 'معاينة الملف'}
      >
        {fileToPreview && (
          <div className="bg-gray-700 p-2 rounded-lg">
            {fileToPreview.type.startsWith('image/') && (
              <img src={fileToPreview.data} alt={fileToPreview.name} className="max-w-full max-h-[75vh] mx-auto rounded" />
            )}
            {fileToPreview.type === 'application/pdf' && (
              <iframe src={fileToPreview.data} className="w-full h-[75vh] border-0 rounded" title={fileToPreview.name} />
            )}
            {!fileToPreview.type.startsWith('image/') && fileToPreview.type !== 'application/pdf' && (
              <div className="text-center p-8 text-gray-300">
                <p className="mb-6 text-lg">لا يمكن عرض هذا النوع من الملفات مباشرة.</p>
                <a 
                  href={fileToPreview.data} 
                  download={fileToPreview.name} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
                >
                  تحميل الملف ({fileToPreview.name})
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}

export default App;