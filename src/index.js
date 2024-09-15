// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD68eRsnBT6LWQnS4-kpB8BTxrE9sals_g",
  authDomain: "developer-portal-swdm.firebaseapp.com",
  projectId: "developer-portal-swdm",
  storageBucket: "developer-portal-swdm.appspot.com",
  messagingSenderId: "1054766857255",
  appId: "1:1054766857255:web:429ae1a998abaa663f6202",
  measurementId: "G-T72NBD77TP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ensure Firebase is set up correctly
console.log('Firebase initialized successfully:', app);

// Initialize Materialize components after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Check if Materialize is loaded
  if (typeof M !== 'undefined') {
    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    // Initialize collapsibles
    const collapsibles = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibles);

    console.log('Materialize components initialized successfully.');
  } else {
    console.error('Materialize library is not loaded. Please ensure Materialize JavaScript is loaded before the bundle.');
  }
});
