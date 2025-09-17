import { Book, User } from '../types';

// NOTE: This file has been refactored to be backend-ready.
// The previous localStorage logic has been replaced with `fetch` calls
// to a hypothetical backend API. To make this work, you need to
// create a backend server (e.g., using Node.js/Express, Python/Flask, etc.)
// that provides these endpoints and handles the actual data storage,
// whether it's a database or the Google Drive API.

const API_BASE_URL = '/api'; // Placeholder for your actual backend URL

// --- Book Service ---

const getBooks = async (userId: string): Promise<Book[]> => {
  // In a real implementation, you'd pass an auth token.
  const response = await fetch(`${API_BASE_URL}/users/${userId}/books`);
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  return response.json();
};

const addBook = async (userId: string, bookData: Omit<Book, 'id'>): Promise<Book> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });
  if (!response.ok) {
    throw new Error('Failed to add book');
  }
  return response.json();
};

const updateBook = async (userId: string, updatedBook: Book): Promise<Book> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/books/${updatedBook.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedBook),
  });
  if (!response.ok) {
    throw new Error('Failed to update book');
  }
  return response.json();
};

const deleteBook = async (userId: string, bookId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/books/${bookId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete book');
  }
};


// --- User & Auth Service ---

// This is a placeholder for a real authentication check.
// In a real app, this might validate a token stored in sessionStorage.
const checkLoginStatus = async (): Promise<User | null> => {
    // This endpoint would return the user object if the session is valid.
    const response = await fetch(`${API_BASE_URL}/auth/status`);
    if (response.ok) {
        return response.json();
    }
    return null;
}

// This would handle logging in and returning a user and a token.
const login = async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }
    const user: User = await response.json();
    // In a real app, the response would likely include a token
    // that you'd store in sessionStorage or localStorage.
    sessionStorage.setItem('authToken', 'some_jwt_token_from_backend'); // Placeholder
    return user;
}

const logout = async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    sessionStorage.removeItem('authToken'); // Placeholder
}


const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
};

const addUser = async (userData: Omit<User, 'id' | 'role'>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, role: 'user' }), // Role is set on the backend
    });
    if (!response.ok) {
        throw new Error('Failed to add user');
    }
    return response.json();
};

const deleteUser = async (userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
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
