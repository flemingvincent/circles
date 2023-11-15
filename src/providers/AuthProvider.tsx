import { Session, User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

import { supabase } from "@/config/supabase";
import { useProfileStore } from "@/stores/profileStore";

type AuthContextProps = {
	user: User | null;
	session: Session | null;
	intialized?: boolean;
	checkUsernameAvailability: (username: string) => Promise<boolean>;
	checkEmailAvailability: (username: string) => Promise<boolean>;
	createAccount: (
		email: string,
		password: string,
		username: string,
		firstName: string,
		lastName: string,
	) => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	verifyOtp: (email: string, token: string) => Promise<string | undefined>;
	forgotPassword: (
		email: string,
		id: string,
		password: string,
	) => Promise<void>;
	updateUsername: (newUsername: string) => Promise<void>;
	updateUserEmail: (newUserEmail: string) => Promise<void>;
	updateUserPassword: (newPassword: string) => Promise<void>;
	logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextProps>({
	user: null,
	session: null,
	intialized: false,
	checkUsernameAvailability: async () => false,
	checkEmailAvailability: async () => false,
	createAccount: async () => {},
	login: async () => {},
	verifyOtp: async () => "",
	forgotPassword: async () => {},
	updateUsername: async () => {},
	updateUserEmail: async () => {},
	updateUserPassword: async () => {},
	logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [intialized, setInitialized] = useState<boolean>(false);

	const { setProfile, removeProfile } = useProfileStore();

	const checkUsernameAvailability = async (username: string) => {
		try {
			const { count: rowCount, error: dbError } = await supabase
				.from("profiles")
				.select("*", { count: "exact", head: true })
				.eq("username", username);

			if (dbError) {
				throw dbError;
			}

			if (rowCount === 0) {
				return Promise.resolve(true);
			} else {
				return Promise.resolve(false);
			}
		} catch (error) {
			throw error;
		}
	};

	const checkEmailAvailability = async (email: string) => {
		try {
			const { count: rowCount, error: dbError } = await supabase
				.from("profiles")
				.select("*", { count: "exact", head: true })
				.eq("email", email);

			if (dbError) {
				throw dbError;
			}

			if (rowCount === 0) {
				return Promise.resolve(true);
			} else {
				return Promise.resolve(false);
			}
		} catch (error) {
			throw error;
		}
	};

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
					avatar_url: null,
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
					avatar_url: dbData![0].avatar_url,
				});
			}
		} catch (error) {
			throw error;
		}
	};

	const verifyOtp = async (email: string, token: string) => {
		try {
			const { data: verifyData, error: verifyError } =
				await supabase.auth.verifyOtp({
					email,
					token,
					type: "recovery",
				});

			if (verifyError) {
				return Promise.resolve("");
			} else {
				return Promise.resolve(verifyData.user?.id);
			}
		} catch (error) {
			throw error;
		}
	};

	const forgotPassword = async (
		email: string,
		id: string,
		password: string,
	) => {
		try {
			const { error: updateError } = await supabase.auth.updateUser({
				password,
			});
			if (updateError) {
				throw updateError;
			} else {
				const { data: dbData, error: dbError } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", id)
					.eq("email", email);

				if (dbError) {
					throw dbError;
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
							avatar_url: dbData![0].avatar_url,
						});
					}
				}
			}
		} catch (error) {
			throw error;
		}
	};

	const updateUsername = async (newUsername: string) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}
			const userId = user.id;

			const { data: dbData, error: dbError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId);

			if (dbError) {
				throw dbError;
			} else {
				setProfile({
					id: userId,
					email: dbData![0].email,
					username: newUsername,
					first_name: dbData![0].first_name,
					last_name: dbData![0].last_name,
					avatar_url: dbData![0].avatar_url,
				});
			}

			const { error: profileError } = await supabase
				.from("profiles")
				.update({ username: newUsername })
				.eq("id", userId);

			if (profileError) {
				throw profileError;
			}

			console.log("Username updated successfully");
		} catch (error) {
			throw error;
		}
	};

	const updateUserEmail = async (newUserEmail: string) => {
		try {
			// Get the current user
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error("User not authenticated");
			}

			const userId = user.id;

			// Update email in the authentication system
			const { error: updateEmailAuthError } = await supabase.auth.updateUser({
				email: newUserEmail,
			});

			if (updateEmailAuthError) {
				console.error(
					"Error updating email in authentication system:",
					updateEmailAuthError,
				);
				throw updateEmailAuthError;
			} else {
				// Update email in the 'profiles' table
				const { data: dbData, error: dbError } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", userId);

				if (dbError) {
					throw dbError;
				} else {
					setProfile({
						id: userId,
						email: newUserEmail,
						username: dbData![0].username,
						first_name: dbData![0].first_name,
						last_name: dbData![0].last_name,
						avatar_url: dbData![0].avatar_url,
					});
				}

				const { error: profileError } = await supabase
					.from("profiles")
					.update({ email: newUserEmail })
					.eq("id", userId);

				if (profileError) {
					console.error(
						"Error updating email in profiles table:",
						profileError,
					);
					throw profileError;
				}
				console.log("Email updated successfully");
			}

			// Successful email update
		} catch (error) {
			console.error("Error in updateUserEmail:", error);
			throw error;
		}
	};
	const updateUserPassword = async (newPassword: string) => {
		try {
			// Get the current user
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error("User not authenticated");
			}

			const userId = user.id;

			// Update email in the authentication system
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (updateError) {
				throw updateError;
			} else {
				const { data: dbData, error: dbError } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", userId);

				if (dbError) {
					throw dbError;
				} else {
					setProfile({
						id: userId,
						email: dbData![0].email,
						username: dbData![0].username,
						first_name: dbData![0].first_name,
						last_name: dbData![0].last_name,
						avatar_url: dbData![0].avatar_url,
					});
				}
				console.log("Password updated successfully");
			}

			// Update email in the 'profiles' table

			// Successful email update
		} catch (error) {
			console.error("Error in updateUserEmail:", error);
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
				checkUsernameAvailability,
				checkEmailAvailability,
				createAccount,
				login,
				verifyOtp,
				forgotPassword,
				updateUsername,
				updateUserEmail,
				updateUserPassword,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
