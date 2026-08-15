import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Anyone who creates an account becomes a manager (Admin/User) who can
  // post and delete content. Visitors who are not logged in stay Readers
  // and can only view.
  const signup = async (username, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (username) {
      await updateProfile(cred.user, { displayName: username });
    }
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        username: username || '',
        email,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    } catch {
      // Non-fatal: profile doc is a nice-to-have, auth account already exists.
    }
    return cred;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
