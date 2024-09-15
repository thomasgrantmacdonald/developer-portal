// index.js

// Import Firebase modules
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD68eRsnBT6LWQnS4-kpB8BTxrE9sals_g",
  authDomain: "developer-portal-swdm.firebaseapp.com",
  projectId: "developer-portal-swdm",
  storageBucket: "developer-portal-swdm.appspot.com",
  messagingSenderId: "1054766857255",
  appId: "1:1054766857255:web:429ae1a998abaa663f6202",
  measurementId: "G-T72NBD77TP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ensure Firebase is set up correctly
console.log("Firebase initialized successfully:", app);

// Initialize Materialize components after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if Materialize is loaded
  if (typeof M !== "undefined") {
    // Initialize modals
    const modals = document.querySelectorAll(".modal");
    M.Modal.init(modals);

    // Initialize collapsibles
    const collapsibles = document.querySelectorAll(".collapsible");
    M.Collapsible.init(collapsibles);

    console.log("Materialize components initialized successfully.");
  } else {
    console.error(
      "Materialize library is not loaded. Please ensure Materialize JavaScript is loaded before the bundle."
    );
  }

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in: ", user);
    } else {
      console.log("User logged out");
    }
  });

  // Signup form handling
  const signupForm = document.querySelector("#signup-form");
  if (signupForm) {
    console.log("Signup form found and event listener attached.");
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Signup form submitted");

      // Get user info
      const email = signupForm["signup-email"].value;
      const password = signupForm["signup-password"].value;
      console.log(email, password);

      // Sign up the user
      createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          console.log("User created:", cred.user);
          const modal = document.querySelector("#modal-signup");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          signupForm.reset(); // Reset the form only after successful signup
        })
        .catch((error) => {
          console.error("Error signing up:", error.message);
        });
    });
  } else {
    console.error("Signup form not found. Please check the form ID.");
  }

  // Logout
  const logout = document.querySelector("#logout");
  if (logout) {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          console.log("User signed out successfully.");
        })
        .catch((error) => {
          console.error("Error signing out:", error.message);
        });
    });
  }

  // Login
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get user info
      const email = loginForm["login-email"].value;
      const password = loginForm["login-password"].value;

      signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          console.log("User signed in:", cred.user);
          // Close the login modal and reset the form
          const modal = document.querySelector("#modal-login");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          loginForm.reset();
        })
        .catch((error) => {
          console.error("Error signing in:", error.message);
        });
    });
  }

  // Get data from Firestore and setup tasks
  const taskCollection = collection(db, "tasks");
  getDocs(taskCollection)
    .then((snapshot) => {
      console.log("Firestore snapshot:", snapshot); // Log the entire snapshot
      if (!snapshot.empty) {
        setupTasks(snapshot.docs);
      } else {
        console.log("No tasks found.");
      }
    })
    .catch((error) => {
      console.error("Error getting tasks:", error.message);
    });
});

// Setup tasks function to render tasks on the page
const setupTasks = (data) => {
  let html = "";
  console.log("Rendering tasks...");

  if (data.length === 0) {
    console.log("No tasks found in data.");
  }

  data.forEach((doc) => {
    const task = doc.data();
    console.log("Task data:", task);

    // Ensure task fields are available
    const title = task.title || "No title";
    const description = task.description || "No description available";
    const fee = task.fee !== undefined ? `$${task.fee}` : "No fee specified";

    const li = `
      <li>
        <div class="collapsible-header grey lighten-4">${title}</div>
        <div class="collapsible-body white">${description}</div>
        <div class="collapsible-body white">${fee}</div>
      </li>
    `;
    html += li;
  });

  // Render the tasks in the collapsible list
  const taskList = document.querySelector(".tasks");
  if (taskList) {
    taskList.innerHTML = html;
    console.log("Tasks rendered successfully.");

    // Re-initialize Materialize CSS collapsible component
    const collapsibles = document.querySelectorAll(".collapsible");
    M.Collapsible.init(collapsibles);
  } else {
    console.error("Task list element not found.");
  }
};
