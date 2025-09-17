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
import BarcodeGenerator from './components/BarcodeGenerator';
import { api } from './services/api';

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
  
  // Fetch user data if the user is an admin
  const fetchUsers = useCallback(async () => {
    if (currentUser?.role === 'admin') {
      try {
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // Optionally, show an error message to the admin user
      }
    }
  }, [currentUser]);

  // Initial data load and session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await api.checkLoginStatus(); // API call to check auth status
        if (user) {
          setCurrentUser(user);
          const userBooks = await api.getBooks(user.id);
          setBooks(userBooks);
          if(user.role === 'admin') {
            const allUsers = await api.getUsers();
            setUsers(allUsers);
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (currentView === View.USER_MANAGEMENT) {
        fetchUsers();
    }
  }, [currentView, fetchUsers]);

  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const user = await api.login(username, password);
      setCurrentUser(user);
      const userBooks = await api.getBooks(user.id);
      setBooks(userBooks);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
      try {
        await api.logout();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        setCurrentUser(null);
        setBooks([]);
        setCurrentView(View.DASHBOARD);
      }
  };
  
  const handleAddUser = useCallback(async (userData: Omit<User, 'id' | 'role'>) => {
    try {
        const newUser = await api.addUser(userData);
        setUsers(prev => [...prev, newUser]);
    } catch (error) {
        console.error("Failed to add user:", error);
        alert("فشل في إضافة المستخدم.");
    }
  }, []);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع كتبه أيضاً.')) {
        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("فشل في حذف المستخدم.");
        }
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
    if (!currentUser) return;
    try {
        if ('id' in bookData && bookData.id) {
          const updatedBook = await api.updateBook(currentUser.id, bookData as Book);
          setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
        } else {
          const newBook = await api.addBook(currentUser.id, bookData);
          setBooks(prev => [...prev, newBook]);
        }
    } catch (error) {
        console.error("Failed to save book:", error);
        alert("فشل في حفظ الكتاب.");
    }
  }, [currentUser]);

  const handleDeleteBook = useCallback(async (bookId: string) => {
    if (!currentUser) return;
    if (window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
        try {
            await api.deleteBook(currentUser.id, bookId);
            setBooks(prev => prev.filter(b => b.id !== bookId));
        } catch (error) {
            console.error("Failed to delete book:", error);
            alert("فشل في حذف الكتاب.");
        }
    }
  }, [currentUser]);

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
        case View.BARCODE_GENERATOR:
            return <BarcodeGenerator />;
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