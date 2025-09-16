import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Book, BookFile, BookType, View } from './types';
import Sidebar from './components/Header';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import SearchBar from './components/SearchBar';
import Modal from './components/Modal';
import BookForm from './components/BookForm';

// --- Data Service Layer (Simulating a real database API) ---
// This section is designed to be easily replaced with actual API calls to a backend service like Firebase or Supabase.
// For now, it uses localStorage but with async functions to mimic network requests.

const BOOKS_STORAGE_KEY = 'books';
const FAKE_LATENCY = 300; // ms

const getBooksFromStorage = (): Book[] => {
  const savedValue = localStorage.getItem(BOOKS_STORAGE_KEY);
  if (savedValue) {
    try {
      return JSON.parse(savedValue);
    } catch (error) {
      console.error('Error parsing books from localStorage', error);
      return [];
    }
  }
  return [];
};

const saveBooksToStorage = (books: Book[]) => {
  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
};

const getBooks = async (): Promise<Book[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getBooksFromStorage());
    }, FAKE_LATENCY);
  });
};

const addBook = async (bookData: Omit<Book, 'id'>): Promise<Book> => {
   return new Promise(resolve => {
    setTimeout(() => {
        const books = getBooksFromStorage();
        const newBook: Book = { ...bookData, id: Date.now().toString() };
        const updatedBooks = [...books, newBook];
        saveBooksToStorage(updatedBooks);
        resolve(newBook);
    }, FAKE_LATENCY);
  });
};

const updateBook = async (updatedBook: Book): Promise<Book> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let books = getBooksFromStorage();
            books = books.map(b => b.id === updatedBook.id ? updatedBook : b);
            saveBooksToStorage(books);
            resolve(updatedBook);
        }, FAKE_LATENCY);
    });
};

const deleteBookFromDb = async (bookId: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let books = getBooksFromStorage();
            books = books.filter(b => b.id !== bookId);
            saveBooksToStorage(books);
            resolve();
        }, FAKE_LATENCY);
    });
};

// --- End of Data Service Layer ---

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<BookFile | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    getBooks().then(data => {
      setBooks(data);
      setIsLoading(false);
    });
  }, []);

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


  const handleSaveBook = useCallback(async (bookData: Omit<Book, 'id'> | Book) => {
    if ('id' in bookData && bookData.id) { // Editing existing book
      const updatedBook = await updateBook(bookData as Book);
      setBooks(prevBooks => prevBooks.map(b => b.id === updatedBook.id ? updatedBook : b));
    } else { // Adding new book
      const newBook = await addBook(bookData);
      setBooks(prevBooks => [...prevBooks, newBook]);
    }
  }, []);

  const handleDeleteBook = useCallback(async (bookId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الكتاب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await deleteBookFromDb(bookId);
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
    }
  }, []);

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
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg">...جاري تحميل البيانات</p>
            </div>
        </div>
    );
  }

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
