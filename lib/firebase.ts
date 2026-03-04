import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase configuration for this project.
// Values are taken directly from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyCtGfqOZ_1j0XSV3_2HEFVdGS9nvcMPS18",
  authDomain: "je-le-apps-test-task.firebaseapp.com",
  projectId: "je-le-apps-test-task",
  storageBucket: "je-le-apps-test-task.appspot.com",
  messagingSenderId: "83358031084",
  appId: "1:83358031084:web:8e95f0e3e4da70fe83d9c9",
  measurementId: "G-7X03NWX0BE",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

