import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSJ-ItynmT-x0FLhDwMkgZOzNUT3I4cbA",
  authDomain: "auth-next-mockapp.firebaseapp.com",
  projectId: "auth-next-mockapp",
  storageBucket: "auth-next-mockapp.appspot.com",
  messagingSenderId: "7406934138",
  appId: "1:7406934138:web:6ce043f6bc63289fddc3c3",
  measurementId: "G-LK216EYG5J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
