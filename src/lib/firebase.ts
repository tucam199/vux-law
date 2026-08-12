// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "vux-fine-central",
  "appId": "1:607991159785:web:b5bb0b5430bd0b92738978",
  "storageBucket": "vux-fine-central.firebasestorage.app",
  "apiKey": "AIzaSyC8tzCbctfevsNbN0HYk932sewwCpb4iLs",
  "authDomain": "vux-fine-central.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "607991159785"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
