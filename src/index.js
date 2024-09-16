// Import Firebase modules
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

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
  // Initialize Materialize components
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);

  const collapsibles = document.querySelectorAll(".collapsible");
  M.Collapsible.init(collapsibles);

  const sidenavs = document.querySelectorAll(".sidenav");
  M.Sidenav.init(sidenavs);

  console.log("Materialize components initialized successfully.");

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    const taskList = document.querySelector(".tasks");
    if (user) {
      // Fetch and display tasks in real-time
      const taskCollection = collection(db, "tasks");
      onSnapshot(
        taskCollection,
        (snapshot) => {
          setupTasks(snapshot.docs);
          setupUI(user);
        },
        (error) => {
          if (error.code === "permission-denied") {
            console.log("Permission denied: Unable to access Firestore without authentication.");
          } else {
            console.error("Error in snapshot listener:", error.message);
          }
        }
      );
    } else {
      console.log("User logged out");
      setupUI();
      if (taskList) {
        taskList.innerHTML = `
          <li class="collection-item center-align" style="font-size: 18px; padding: 20px;">
            <p style="font-size: 1.2em; margin-top: 10px;">
              <a href="#" class="modal-trigger" data-target="modal-login" style="color: #2B2C78; font-weight: bold; margin-right: 5px;">Login</a> 
              or 
              <a href="#" class="modal-trigger" data-target="modal-signup" style="color: #2B2C78; font-weight: bold; margin-left: 5px; margin-right: 5px">Sign Up</a>
              to view available tasks.
            </p>
            <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWRuN2M4YWg4MDAyN2xkNjd6ZGRtbXoxcDRhd3ZqdXhyM3pwcHBtMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/bWGugCywc1x28wgqeC/giphy.gif" alt="Login Required" style="max-width: 100%; height: auto; margin-top: 20px;">
          </li>
        `;
      }
    }
  });

  // Create new task
  const createForm = document.querySelector("#create-form");
  if (createForm) {
    createForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = createForm.querySelector("#title").value;
      const description = createForm.querySelector("#description").value;
      const fee = createForm.querySelector("#fee").value;

      addDoc(collection(db, "tasks"), { title, description, fee })
        .then((docRef) => {
          addTaskToDOM({ title, description, fee, id: docRef.id });
          const modal = document.querySelector("#modal-create");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          createForm.reset();
        })
        .catch((error) => {
          console.error("Error adding task:", error.message);
          M.toast({ html: `Error: ${error.message}`, classes: "red darken-1" });
        });
    });
  }

  // Handle Signup
  const signupForm = document.querySelector("#signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupForm["signup-email"].value;
      const password = signupForm["signup-password"].value;

      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          const modal = document.querySelector("#modal-signup");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          signupForm.reset();
        })
        .catch((error) => {
          M.toast({ html: `Error: ${error.message}`, classes: "red darken-1" });
        });
    });
  }

  // Attach logout listener to both primary and sidenav buttons
  const logoutButtons = document.querySelectorAll("#logout");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          console.log("User signed out successfully.");
        })
        .catch((error) => {
          M.toast({ html: `Error: ${error.message}`, classes: "red darken-1" });
        });
    });
  });

  // Handle Login
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm["login-email"].value;
      const password = loginForm["login-password"].value;

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          const modal = document.querySelector("#modal-login");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          loginForm.reset();
        })
        .catch((error) => {
          M.toast({ html: `Error: ${error.message}`, classes: "red darken-1" });
        });
    });
  }
});

// Update the UI based on login status
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const accountDetails = document.querySelector(".account-details");

const setupUI = (user) => {
  if (user) {
    const html = `<div>Logged in as ${user.email}</div>`;
    accountDetails.innerHTML = html;
    loggedInLinks.forEach((item) => (item.style.display = "block"));
    loggedOutLinks.forEach((item) => (item.style.display = "none"));
  } else {
    accountDetails.innerHTML = "";
    loggedInLinks.forEach((item) => (item.style.display = "none"));
    loggedOutLinks.forEach((item) => (item.style.display = "block"));
  }
};

// Render tasks on the page
const setupTasks = (data = []) => {
  let html = "";
  if (!Array.isArray(data) || data.length === 0) {
    console.log("No tasks found in data.");
    return;
  }

  data.forEach((doc) => {
    const task = doc.data();
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

  const taskList = document.querySelector(".tasks");
  if (taskList) {
    taskList.innerHTML = html;
    M.Collapsible.init(document.querySelectorAll(".collapsible"));
  } else {
    console.error("Task list element not found.");
  }
};

// Add a task directly to the DOM
const addTaskToDOM = (task) => {
  const taskList = document.querySelector(".tasks");
  const title = task.title || "No title";
  const description = task.description || "No description available";
  const fee = task.fee !== undefined ? `$${task.fee}` : "No fee specified";

  const li = document.createElement("li");
  li.innerHTML = `
    <div class="collapsible-header grey lighten-4">${title}</div>
    <div class="collapsible-body white">${description}</div>
    <div class="collapsible-body white">${fee}</div>
  `;

  if (taskList) {
    taskList.prepend(li);
    M.Collapsible.init(document.querySelectorAll(".collapsible"));
  } else {
    console.error("Task list element not found.");
  }
};
