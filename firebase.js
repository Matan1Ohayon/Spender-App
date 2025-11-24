// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLwnutxRevi5-QU1VPCMafo7XPvu0TAr4",
  authDomain: "spnder-app.firebaseapp.com",
  projectId: "spnder-app",
  storageBucket: "spnder-app.firebasestorage.app",
  messagingSenderId: "621286241030",
  appId: "1:621286241030:web:6bfa4b36f3cf973cd02487"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore + Storage only
export const db = getFirestore(app);
export const storage = getStorage(app);
