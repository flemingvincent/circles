import { Session, User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

import { supabase } from "@/config/supabase";
import { useProfileStore } from "@/stores/profileStore";

type AuthContextProps = {
	user: User | null;
	session: Session | null;
	intialized?: boolean;
	createAccount: (
		email: string,
		password: string,
		username: string,
		firstName: string,
		lastName: string,
	) => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	forgotPassword: (
		email: string,
		token: string,
		password: string,
	) => Promise<void>;
	logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps>({
	user: null,
	session: null,
	intialized: false,
	createAccount: async () => {},
	login: async () => {},
	forgotPassword: async () => {},
	logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [intialized, setInitialized] = useState<boolean>(false);

	const { setProfile, removeProfile } = useProfileStore();

	const createAccount = async (
		email: string,
		password: string,
		username: string,
		firstName: string,
		lastName: string,
	) => {
		try {
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
			});

			const { error: dbError } = await supabase
				.from("profiles")
				.update({
					email,
					username,
					first_name: firstName,
					last_name: lastName,
					updated_at: new Date(),
				})
				.eq("id", data.user?.id);

			if (signUpError || dbError) {
				throw signUpError || dbError;
			} else {
				setProfile({
					id: data.user!.id,
					email,
					username,
					first_name: firstName,
					last_name: lastName,
				});
			}
		} catch (error) {
			throw error;
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const { data: signInData, error: signInError } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});

			const { data: dbData, error: dbError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", signInData.user?.id);

			if (signInError || dbError) {
				throw signInError || dbError;
			} else {
				setProfile({
					id: signInData.user!.id,
					email: dbData![0].email,
					username: dbData![0].username,
					first_name: dbData![0].first_name,
					last_name: dbData![0].last_name,
				});
			}
		} catch (error) {
			throw error;
		}
	};

	const forgotPassword = async (
		email: string,
		token: string,
		password: string,
	) => {
		try {
			const { data: verifyData, error: verifyError } =
				await supabase.auth.verifyOtp({
					email,
					token,
					type: "recovery",
				});

			if (verifyError) {
				throw verifyError;
			} else {
				const { error: updateError } = await supabase.auth.updateUser({
					password,
				});
				if (updateError) {
					throw updateError;
				} else {
					const { data: dbData, error: dbError } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", verifyData.user?.id);

					if (dbError) {
						throw dbError;
					} else {
						setProfile({
							id: verifyData.user!.id,
							email: dbData![0].email,
							username: dbData![0].username,
							first_name: dbData![0].first_name,
							last_name: dbData![0].last_name,
						});
					}
				}
			}
		} catch (error) {
			throw error;
		}
	};

	const logout = async () => {
		try {
			await supabase.auth.signOut();
			removeProfile();
		} catch (error) {
			throw error;
		}
	};

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
			setSession(session);
			setUser(session ? session.user : null);
			setInitialized(true);
		});
		return () => {
			data.subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				intialized,
				createAccount,
				login,
				forgotPassword,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
