// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

// Cloud Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuZC7UZTA4--5RZz-oW5DAL_391skUy6Q",
  authDomain: "asa-nao.firebaseapp.com",
  projectId: "asa-nao",
  storageBucket: "asa-nao.firebasestorage.app",
  messagingSenderId: "217582794284",
  appId: "1:217582794284:web:8a75a89dc1f6e9ee0f0389"
};

// Initialisation
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);