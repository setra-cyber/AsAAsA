// ======================================
// ASA - CONFIGURATION FIREBASE
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// ======================================
// CONFIGURATION DU PROJET
// ======================================

const firebaseConfig = {
  apiKey: "AIzaSyAG6n0TGCz_oHrU8wSw0pqoyb3reIYSjnU",
  authDomain: "asaasa-612ca.firebaseapp.com",
  projectId: "asaasa-612ca",
  storageBucket: "asaasa-612ca.firebasestorage.app",
  messagingSenderId: "533696167891",
  appId: "1:533696167891:web:8cbe6e8d8b921cd867b926"
};

// ======================================
// INITIALISATION
// ======================================

const app = initializeApp(firebaseConfig);

// Authentification
export const auth = getAuth(app);

// Base de données
export const db = getFirestore(app);

console.log("Firebase connecté avec succès !");
