/**
 * Auth Context
 * 
 * Provides authentication state to the entire app using React Context.
 * 
 * Stores:
 * - user object (id, name, email, role)
 * - token (JWT)
 * - loading state
 * 
 * Provides:
 * - login() — local email/password login
 * - firebaseLogin() — Firebase auth flow
 * - register() — local registration
 * - logout()
 * 
 * The user and token are persisted in localStorage so they survive page refreshes.
 */
import { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios';
import { auth } from '../firebase/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Save auth data to state and localStorage
  const saveAuth = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Local login (email + password → backend JWT)
   */
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    saveAuth(res.data.data.user, res.data.data.token);
    return res.data;
  };

  /**
   * Local registration
   */
  const register = async (name, email, password, role) => {
    const res = await API.post('/auth/register', { name, email, password, role });
    saveAuth(res.data.data.user, res.data.data.token);
    return res.data;
  };

  /**
   * Firebase Authentication Flow:
   * 1. Sign in with Firebase (email/password)
   * 2. Get Firebase ID token
   * 3. Send to backend /api/auth/firebase
   * 4. Backend verifies and returns app JWT
   * 5. Save the app JWT for future API calls
   */
  const firebaseLogin = async (email, password, isRegister = false, name = '', role = 'customer') => {
    let userCredential;

    if (isRegister) {
      // Create new Firebase user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      // Sign in existing Firebase user
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }

    // Get the Firebase ID token
    const idToken = await userCredential.user.getIdToken();

    // Send to backend for verification and app JWT
    const res = await API.post('/auth/firebase', {
      idToken,
      role: isRegister ? role : undefined,
    });

    saveAuth(res.data.data.user, res.data.data.token);
    return res.data;
  };

  /**
   * Logout — clear everything
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Sign out of Firebase too
    auth.signOut().catch(() => {});
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    firebaseLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
