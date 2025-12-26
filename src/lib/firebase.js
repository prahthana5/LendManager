import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your specific Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCb_IZoGuGlXcgG6XLaRF5Sfas6uUb4b7A",
    authDomain: "lend-manager-7b5b3.firebaseapp.com",
    projectId: "lend-manager-7b5b3",
    storageBucket: "lend-manager-7b5b3.firebasestorage.app",
    messagingSenderId: "708702544908",
    appId: "1:708702544908:web:724aaf30e7e098147a7a29",
    measurementId: "G-1RVWT4KR7H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
