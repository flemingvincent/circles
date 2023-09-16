import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";

export const _signUpWithEmailAndPassword = async (
	email: any,
	password: any,
) => {
	try {
		const auth = getAuth();
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);
		return userCredential.user;
	} catch (error) {
		throw error;
	}
};

export const _signInWithEmailAndPassword = async (
	email: any,
	password: any,
) => {
	try {
		const auth = getAuth();
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password,
		);
		return userCredential.user;
	} catch (error) {
		throw error;
	}
};

export const _signOut = async () => {
	try {
		const auth = getAuth();
		await auth.signOut;
	} catch (error) {
		throw error;
	}
};

// Add more authentication-related functions as needed
