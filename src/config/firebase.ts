import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
	apiKey: "AIzaSyDZkGbZNNd6MG-eXBYhzcvBYL6YGsjn8lk",
	authDomain: "circles-da7a6.firebaseapp.com",
	projectId: "circles-da7a6",
	storageBucket: "circles-da7a6.appspot.com",
	messagingSenderId: "148136229772",
	appId: "1:148136229772:web:9fdd46df41b282c971b4a9",
	measurementId: "G-EYGKMYWXT5",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

//const analytics = getAnalytics(app);

export { auth, db };
