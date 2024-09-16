// Import Firebase modules
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, onSnapshot } from "firebase/firestore";

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
    const taskList = document.querySelector(".tasks");
    console.log(user);

    if (user) {
      // Fetch and display tasks in real-time
      const taskCollection = collection(db, "tasks");
      try {
        onSnapshot(
          taskCollection,
          (snapshot) => {
            console.log("Firestore snapshot:", snapshot);
            if (!snapshot.empty) {
              setupTasks(snapshot.docs);
              setupUI(user);
            } else {
              setupTasks([]);
              setupUI(user);
            }
          },
          (error) => {
            // Handle the Firestore permission error when the user is logged out
            if (error.code === "permission-denied") {
              console.log(
                "Permission denied: Unable to access Firestore without authentication."
              );
            } else {
              console.error("Error in snapshot listener:", error.message);
              M.toast({
                html: `Error: ${error.message}`,
                classes: "red darken-1",
              });
            }
          }
        );
      } catch (error) {
        console.error("Error while setting up Firestore listener:", error.message);
      }
    } else {
      console.log("User logged out");
      setupUI(); // Update UI when logged out

      // Display a message prompting the user to log in to view tasks with a GIF
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

      // Access form fields correctly
      const title = createForm.querySelector("#title").value;
      const description = createForm.querySelector("#description").value;
      const fee = createForm.querySelector("#fee").value;

      // Add the task to Firestore
      addDoc(collection(db, "tasks"), {
        title: title,
        description: description,
        fee: fee,
      })
        .then((docRef) => {
          // Manually add the task to the DOM immediately
          addTaskToDOM({ title, description, fee, id: docRef.id });

          // Close the modal and reset the form
          const modal = document.querySelector("#modal-create");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          createForm.reset();
          console.log("Task added successfully.");
        })
        .catch((error) => {
          console.error("Error adding task:", error.message);
          M.toast({
            html: `Error: ${error.message}`,
            classes: "red darken-1",
          });
        });
    });
  } else {
    console.error("Create form not found. Please check the form ID.");
  }

  // Signup form handling
  const signupForm = document.querySelector("#signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupForm["signup-email"].value;
      const password = signupForm["signup-password"].value;

      createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          const modal = document.querySelector("#modal-signup");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          signupForm.reset();
        })
        .catch((error) => {
          M.toast({
            html: `Error: ${error.message}`,
            classes: "red darken-1",
          });
        });
    });
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
          M.toast({
            html: `Error: ${error.message}`,
            classes: "red darken-1",
          });
        });
    });
  }

  // Login
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm["login-email"].value;
      const password = loginForm["login-password"].value;

      signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          const modal = document.querySelector("#modal-login");
          if (modal) {
            M.Modal.getInstance(modal).close();
          }
          loginForm.reset();
        })
        .catch((error) => {
          M.toast({
            html: `Error: ${error.message}`,
            classes: "red darken-1",
          });
        });
    });
  }
});

// Update the UI based upon login status
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const accountDetails = document.querySelector(".account-details");

const setupUI = (user) => {
  if (user) {
    // Account info
    const html = `
      <div>Logged in as ${user.email}</div>
    `;
    accountDetails.innerHTML = html;

    loggedInLinks.forEach((item) => (item.style.display = "block"));
    loggedOutLinks.forEach((item) => (item.style.display = "none"));
  } else {
    // Hide account info
    accountDetails.innerHTML = "";

    loggedInLinks.forEach((item) => (item.style.display = "none"));
    loggedOutLinks.forEach((item) => (item.style.display = "block"));
  }
};

// Setup tasks function to render tasks on the page
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

// Function to add a task directly to the DOM
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
    taskList.prepend(li); // Adds the new task to the top of the list
    M.Collapsible.init(document.querySelectorAll(".collapsible"));
  } else {
    console.error("Task list element not found.");
  }
};
