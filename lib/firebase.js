// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBSJ-ItynmT-x0FLhDwMkgZOzNUT3I4cbA",
  authDomain: "auth-next-mockapp.firebaseapp.com",
  projectId: "auth-next-mockapp",
  storageBucket: "auth-next-mockapp.firebasestorage.app",
  messagingSenderId: "7406934138",
  appId: "1:7406934138:web:6ce043f6bc63289fddc3c3",
  measurementId: "G-LK216EYG5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)