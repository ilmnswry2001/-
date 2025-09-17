import { Book, User } from '../types';

// --- طبقة خدمة البيانات (باستخدام localStorage لمحاكاة قاعدة بيانات) ---

// دالة مساعدة لجلب البيانات من localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue) as T;
    } catch (e) {
      console.error(`خطأ في تحليل مفتاح localStorage "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

// دالة مساعدة لتخزين البيانات في localStorage
const setInStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// تهيئة مستخدم مسؤول افتراضي إذا لم يكن هناك مستخدمون
const initializeUsers = () => {
  const users = getFromStorage<User[]>('users', []);
  if (users.length === 0) {
    const adminUser: User = {
      id: 'admin_user_01',
      username: 'admin',
      password: 'password', // في تطبيق حقيقي، يجب تشفير كلمة المرور هذه
      role: 'admin',
    };
    setInStorage('users', [adminUser]);
  }
};

initializeUsers();

// --- خدمة الكتب ---

const getBooksStorageKey = (userId: string) => `books_${userId}`;

const getBooks = async (userId: string): Promise<Book[]> => {
  const books = getFromStorage<Book[]>(getBooksStorageKey(userId), []);
  return Promise.resolve(books);
};

const addBook = async (userId: string, bookData: Omit<Book, 'id'>): Promise<Book> => {
  const books = await getBooks(userId);
  const newBook: Book = {
    ...bookData,
    id: Date.now().toString(),
  };
  setInStorage(getBooksStorageKey(userId), [...books, newBook]);
  return Promise.resolve(newBook);
};

const updateBook = async (userId: string, updatedBook: Book): Promise<Book> => {
  let books = await getBooks(userId);
  books = books.map(book => (book.id === updatedBook.id ? updatedBook : book));
  setInStorage(getBooksStorageKey(userId), books);
  return Promise.resolve(updatedBook);
};

const deleteBook = async (userId: string, bookId: string): Promise<void> => {
  let books = await getBooks(userId);
  books = books.filter(book => book.id !== bookId);
  setInStorage(getBooksStorageKey(userId), books);
  return Promise.resolve();
};

// --- خدمة المستخدمين والمصادقة ---

const checkLoginStatus = async (): Promise<User | null> => {
  const loggedInUserId = sessionStorage.getItem('loggedInUserId');
  if (!loggedInUserId) {
    return Promise.resolve(null);
  }
  const users = getFromStorage<User[]>('users', []);
  const user = users.find(u => u.id === loggedInUserId);
  return Promise.resolve(user || null);
};

const login = async (username: string, password: string): Promise<User> => {
  const users = getFromStorage<User[]>('users', []);
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    sessionStorage.setItem('loggedInUserId', user.id);
    return Promise.resolve(user);
  } else {
    return Promise.reject(new Error('اسم المستخدم أو كلمة المرور غير صحيحة.'));
  }
};

const logout = async (): Promise<void> => {
  sessionStorage.removeItem('loggedInUserId');
  return Promise.resolve();
};

const getUsers = async (): Promise<User[]> => {
  const users = getFromStorage<User[]>('users', []);
  return Promise.resolve(users);
};

const addUser = async (userData: Omit<User, 'id' | 'role'>): Promise<User> => {
  const users = await getUsers();
  if (users.some(u => u.username === userData.username)) {
      return Promise.reject(new Error('اسم المستخدم موجود بالفعل.'));
  }
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    role: 'user',
  };
  setInStorage('users', [...users, newUser]);
  return Promise.resolve(newUser);
};

const deleteUser = async (userId: string): Promise<void> => {
  let users = await getUsers();
  users = users.filter(user => user.id !== userId);
  setInStorage('users', users);
  // حذف كتب المستخدم أيضًا
  localStorage.removeItem(getBooksStorageKey(userId));
  return Promise.resolve();
};

export const api = {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getUsers,
  addUser,
  deleteUser,
  login,
  logout,
  checkLoginStatus,
};
