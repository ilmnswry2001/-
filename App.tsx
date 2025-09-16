import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Book, BookFile, BookType, View, User } from './types';
import Sidebar from './components/Header';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import SearchBar from './components/SearchBar';
import Modal from './components/Modal';
import BookForm from './components/BookForm';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

// --- Data Service Layer ---
const FAKE_LATENCY = 300;

// --- Book Service ---
const BOOKS_STORAGE_KEY = 'books';
const getBooksFromStorage = (): Book[] => {
  const savedValue = localStorage.getItem(BOOKS_STORAGE_KEY);
  return savedValue ? JSON.parse(savedValue) : [];
};
const saveBooksToStorage = (books: Book[]) => {
  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
};
const getBooks = async (): Promise<Book[]> => new Promise(resolve => setTimeout(() => resolve(getBooksFromStorage()), FAKE_LATENCY));
const addBookToDb = async (bookData: Omit<Book, 'id'>): Promise<Book> => new Promise(resolve => {
  setTimeout(() => {
    const books = getBooksFromStorage();
    const newBook: Book = { ...bookData, id: Date.now().toString() };
    saveBooksToStorage([...books, newBook]);
    resolve(newBook);
  }, FAKE_LATENCY);
});
const updateBookInDb = async (updatedBook: Book): Promise<Book> => new Promise(resolve => {
  setTimeout(() => {
    let books = getBooksFromStorage();
    books = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    saveBooksToStorage(books);
    resolve(updatedBook);
  }, FAKE_LATENCY);
});
const deleteBookFromDb = async (bookId: string): Promise<void> => new Promise(resolve => {
  setTimeout(() => {
    let books = getBooksFromStorage();
    books = books.filter(b => b.id !== bookId);
    saveBooksToStorage(books);
    resolve();
  }, FAKE_LATENCY);
});

// --- User Service ---
const USERS_STORAGE_KEY = 'users';
const getUsersFromStorage = (): User[] => {
    const savedValue = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedValue) {
        return JSON.parse(savedValue);
    }
    // Bootstrap with a default admin user if no users exist
    const adminUser: User = { id: '1', username: 'admin', password: 'admin', role: 'admin' };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([adminUser]));
    return [adminUser];
};
const saveUsersToStorage = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};
const getUsers = async (): Promise<User[]> => new Promise(resolve => setTimeout(() => resolve(getUsersFromStorage()), FAKE_LATENCY));
const addUserToDb = async (userData: Omit<User, 'id' | 'role'>): Promise<User> => new Promise(resolve => {
    setTimeout(() => {
        const users = getUsersFromStorage();
        const newUser: User = { ...userData, id: Date.now().toString(), role: 'user' };
        saveUsersToStorage([...users, newUser]);
        resolve(newUser);
    }, FAKE_LATENCY);
});
const deleteUserFromDb = async (userId: string): Promise<void> => new Promise(resolve => {
    setTimeout(() => {
        let users = getUsersFromStorage();
        users = users.filter(u => u.id !== userId);
        saveUsersToStorage(users);
        resolve();
    }, FAKE_LATENCY);
});

// --- Main App Component ---
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<BookFile | null>(null);
  
  // Initial data load and session check
  useEffect(() => {
    const loadData = async () => {
      const storedUsers = await getUsers();
      setUsers(storedUsers);

      const loggedInUserId = sessionStorage.getItem('loggedInUserId');
      if (loggedInUserId) {
        const user = storedUsers.find(u => u.id === loggedInUserId);
        if (user) {
          setCurrentUser(user);
          const storedBooks = await getBooks();
          setBooks(storedBooks);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  const handleLogin = async (username: string, password: string): Promise<void> => {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
          setIsLoading(true);
          setAuthError(null);
          setCurrentUser(user);
          sessionStorage.setItem('loggedInUserId', user.id);
          const storedBooks = await getBooks();
          setBooks(storedBooks);
          setIsLoading(false);
      } else {
          setAuthError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      sessionStorage.removeItem('loggedInUserId');
      setCurrentView(View.DASHBOARD); // Reset view on logout
  };
  
  const handleAddUser = useCallback(async (userData: Omit<User, 'id' | 'role'>) => {
    const newUser = await addUserToDb(userData);
    setUsers(prev => [...prev, newUser]);
  }, []);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await deleteUserFromDb(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
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
    if ('id' in bookData && bookData.id) {
      const updatedBook = await updateBookInDb(bookData as Book);
      setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    } else {
      const newBook = await addBookToDb(bookData);
      setBooks(prev => [...prev, newBook]);
    }
  }, []);

  const handleDeleteBook = useCallback(async (bookId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      await deleteBookFromDb(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    }
  }, []);

  const filteredBooks = useMemo(() => {
    let booksToShow = books;
    if (currentView === View.INCOMING) booksToShow = books.filter(b => b.type === BookType.INCOMING);
    else if (currentView === View.OUTGOING) booksToShow = books.filter(b => b.type === BookType.OUTGOING);
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

  const renderContent = () => {
    switch(currentView) {
        case View.DASHBOARD:
            return <Dashboard books={books} onOpenFilePreview={handleOpenFilePreview} />;
        case View.USER_MANAGEMENT:
            return <UserManagement users={users} currentUser={currentUser!} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />;
        default:
            const title = currentView === View.INCOMING ? 'قائمة الكتب الواردة' : 'قائمة الكتب الصادرة';
            return (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
                    <div className="mb-6"><SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /></div>
                    <BookList books={filteredBooks} onEdit={handleEditBookClick} onDelete={handleDeleteBook} onOpenFilePreview={handleOpenFilePreview} />
                </div>
            );
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
                <p className="mt-4 text-lg">...جاري التحميل</p>
            </div>
        </div>
    );
  }

  if (!currentUser) {
      return <Login onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onAddBook={handleAddBookClick}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <main className="mr-64 p-4 sm:p-8">
        {renderContent()}
      </main>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={bookToEdit ? 'تعديل كتاب' : 'إضافة كتاب جديد'}>
        <BookForm bookToEdit={bookToEdit} onSave={handleSaveBook} onClose={handleCloseForm} />
      </Modal>

      <Modal isOpen={isFilePreviewOpen} onClose={handleCloseFilePreview} title={fileToPreview?.name || 'معاينة الملف'}>
        {fileToPreview && (
          <div className="bg-gray-700 p-2 rounded-lg">
            {fileToPreview.type.startsWith('image/') ? (
              <img src={fileToPreview.data} alt={fileToPreview.name} className="max-w-full max-h-[75vh] mx-auto rounded" />
            ) : fileToPreview.type === 'application/pdf' ? (
              <iframe src={fileToPreview.data} className="w-full h-[75vh] border-0 rounded" title={fileToPreview.name} />
            ) : (
              <div className="text-center p-8 text-gray-300">
                <p className="mb-6 text-lg">لا يمكن عرض هذا النوع من الملفات مباشرة.</p>
                <a href={fileToPreview.data} download={fileToPreview.name} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold">
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
