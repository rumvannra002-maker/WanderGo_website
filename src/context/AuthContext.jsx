import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user' | null (unknown/logged out)
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        setRole(null);
        setRoleLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Live-subscribe to this user's profile doc so role changes (e.g. an
  // admin promoting/demoting someone from the Users page) take effect
  // immediately without needing to log out and back in.
  useEffect(() => {
    if (!user) return undefined;
    setRoleLoading(true);
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setRole(snap.exists() ? snap.data().role || 'user' : 'user');
        setRoleLoading(false);
      },
      () => {
        setRole('user');
        setRoleLoading(false);
      }
    );
    return unsub;
  }, [user]);

  // Reader vs Admin/User access:
  // - Not logged in -> can only browse (Reader).
  // - Logged in, role "user" -> a normal account, still cannot reach /admin.
  // - Logged in, role "admin" -> full access to the dashboard.
  // Bootstrapping: a small public flag doc (meta/bootstrap, readable by
  // anyone, see firestore.rules) tracks whether an admin has ever been
  // created. The very first person to ever sign up becomes admin
  // automatically; everyone after that starts as a plain "user" and has to
  // be promoted by an existing admin from Admin > Users. (Querying the
  // `users` collection directly isn't possible here since the signing-up
  // visitor isn't authenticated yet, so a dedicated flag doc is used
  // instead of exposing the user list to signed-out visitors.)
  const signup = async (username, email, password) => {
    let isFirstAdmin = false;
    try {
      const bootstrapSnap = await getDoc(doc(db, 'meta', 'bootstrap'));
      isFirstAdmin = !bootstrapSnap.exists() || bootstrapSnap.data().adminCreated !== true;
    } catch {
      // If the flag can't be read for some reason, default to "not first
      // admin" — safer to under-grant than to over-grant admin access.
      isFirstAdmin = false;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (username) {
      await updateProfile(cred.user, { displayName: username });
    }
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        username: username || '',
        email,
        role: isFirstAdmin ? 'admin' : 'user',
        createdAt: serverTimestamp(),
      });
      if (isFirstAdmin) {
        await setDoc(doc(db, 'meta', 'bootstrap'), { adminCreated: true });
      }
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
    role,
    loading: loading || (!!user && roleLoading),
    isLoggedIn: !!user,
    isAdmin: role === 'admin',
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
