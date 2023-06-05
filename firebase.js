
import firebase from 'firebase/app';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCg0rUdvw_73_4-gEIlCbij4hipK8YPL0k",
  authDomain: "learner-50919.firebaseapp.com",
  projectId: "learner-50919",
  storageBucket: "learner-50919.appspot.com",
  messagingSenderId: "613927976869",
  appId: "1:613927976869:web:3317fd57f351c80698724c",
  measurementId: "G-51S0GTH0JK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase Storage
export const storage = firebase.storage();


  
  
  

  
 