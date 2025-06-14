import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "novamart-98059.firebaseapp.com",
  projectId: "novamart-98059",
  storageBucket: "novamart-98059.firebasestorage.app",
  messagingSenderId: "459730351333",
  appId: "1:459730351333:web:01c1a6bfc1db68d3ed100c",
  measurementId: "G-H5BBEW7VPR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export { storage };
