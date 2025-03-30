import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function isAuthenticate() {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Clean up listener
      resolve(!!user); // Resolve true if a user exists, false otherwise
    });
  });
}
