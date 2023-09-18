import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";

import { auth } from "@/config/firebase";

type FirebaseContextProps = {
	user: User | null;
	createAccount: (email: string, password: string) => Promise<User | null>;
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

	const createAccount = async (email: string, password: string) => {
		try {
			const result = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);

			setUser(result.user);

			// TODO: Use firestore and update users table with firstname, lastname, username, etc.

			return result.user;
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
