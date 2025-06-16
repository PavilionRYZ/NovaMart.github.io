import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FRONTEND_API_GOOGLE_AUTHENTICATE,
  authDomain: "finerestate-c1c19.firebaseapp.com",
  projectId: "finerestate-c1c19",
  storageBucket: "finerestate-c1c19.appspot.com",
  messagingSenderId: "78208675976",
  appId: "1:78208675976:web:0647a721a15f707061af3d",
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { storage };
