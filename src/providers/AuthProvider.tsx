import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";

import { auth, db } from "@/config/firebase";
import { useProfileStore } from "@/stores/profileStore";

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
	const { setProfile, removeProfile } = useProfileStore();

	const createAccount = async (
		email: string,
		password: string,
		username: string,
		firstName: string,
		lastName: string,
	) => {
		try {
			const result = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);

			setUser(result.user);

			const docRef = doc(db, "users", result.user.uid);

			await setDoc(docRef, {
				email,
				username,
				firstName,
				lastName,
			});

			setProfile({
				userId: result.user.uid,
				email,
				username,
				firstName,
				lastName,
			});

			return result.user;
		} catch (error) {
			throw error;
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const result = await signInWithEmailAndPassword(auth, email, password);

			setUser(result.user);

			const docRef = doc(db, "users", result.user.uid);

			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setProfile({
					userId: result.user.uid,
					email,
					username: docSnap.data()?.username,
					firstName: docSnap.data()?.firstName,
					lastName: docSnap.data()?.lastName,
				});
			}

			return result.user;
		} catch (error) {
			throw error;
		}
	};

	const logout = async () => {
		try {
			await auth.signOut();
			setUser(null);
			removeProfile();
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
