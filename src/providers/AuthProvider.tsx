import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import {
	getFirestore,
	collection,
	addDoc,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import { createContext, useEffect, useState } from "react";

import { auth } from "@/config/firebase";

type FirebaseContextProps = {
	user: User | null;
	createAccount: (
		email: string,
		password: string,
		username: string,
		firstName: string,
		lastName: string,
	) => Promise<User | null>;
	login: (email: string, password: string) => Promise<User | null>;
	logout: () => Promise<void>;
};

export const FirebaseContext = createContext<FirebaseContextProps>({
	user: null,
	createAccount: async (email: string, password: string) => null,
	login: async (email: string, password: string) => null,
	logout: async () => {},
});

export const FirebaseProvider = ({ children }: any) => {
	const [user, setUser] = useState<User | null>(null);

	const createAccount = async (
		email: string,
		password: string,
		username: string,
		firstName: string,
		lastName: string,
	) => {
		try {
			// Create Firebase Auth user
			const result = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			const user = result.user;

			// Add user to Firestore Collection
			const db = getFirestore();
			const usersCollection = collection(db, "users");

			// Check if the "users" collection exists, and create it if it doesn't
			const collectionRef = usersCollection.withConverter({
				toFirestore: (user) => ({
					uid: result.user.uid,
					email,
					username,
					firstName,
					lastName,
				}),
				fromFirestore: (snapshot) => snapshot.data(),
			});

			// Attempt to add a new user document with user data
			await addDoc(collectionRef, {
				uid: user.uid,
				email,
				username,
				firstName,
				lastName,
			});

			setUser(user);

			return user;
		} catch (error) {
			throw error;
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const result = await signInWithEmailAndPassword(auth, email, password);
			setUser(result.user);
			return result.user;
		} catch (error) {
			throw error;
		}
	};

	const logout = async () => {
		try {
			await auth.signOut();
			setUser(null);
		} catch (error) {
			throw error;
		}
	};

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUser(user);
		});

		return () => unsubscribe();
	}, [user]);

	return (
		<FirebaseContext.Provider
			value={{
				user,
				createAccount,
				login,
				logout,
			}}
		>
			{children}
		</FirebaseContext.Provider>
	);
};
