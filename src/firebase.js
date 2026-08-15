import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD5aARcLbaeqpasdAqnSk4eh0bIbGrUbIo',
  authDomain: 'my-tourist2-website.firebaseapp.com',
  projectId: 'my-tourist2-website',
  storageBucket: 'my-tourist2-website.firebasestorage.app',
  messagingSenderId: '1027622520725',
  appId: '1:1027622520725:web:db08674c79959d9aea189c',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;