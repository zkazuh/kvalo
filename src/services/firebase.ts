// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCiPg6tM1HPWBZLUtKNWdxCfZRHBnaW5qU",
  authDomain: "bostil-be430.firebaseapp.com",
  projectId: "bostil-be430",
  storageBucket: "bostil-be430.firebasestorage.app",
  messagingSenderId: "443256275134",
  appId: "1:443256275134:web:f5fe9a95bfbb5e2afd5eef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getDatabase(app, "https://bostil-be430-default-rtdb.europe-west1.firebasedatabase.app");
