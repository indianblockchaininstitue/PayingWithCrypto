import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo_L7b4NcWF7G2JBiti98MfvxQfVMwW4g",
  authDomain: "cryptoecommerce-4ebfc.firebaseapp.com",
  projectId: "cryptoecommerce-4ebfc",
  storageBucket: "cryptoecommerce-4ebfc.appspot.com",
  messagingSenderId: "845467325454",
  appId: "1:845467325454:web:9c8bdbce1d7e338bcd185f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export  {
  storage, app as default
}