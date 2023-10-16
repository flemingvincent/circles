import { createContext } from "react";

import { supabase } from "@/config/supabase";

export type LocationContextProps = {
	updateUserLocation: (
		userId: string,
		latitude: number,
		longitude: number,
	) => Promise<void>;
};

export const LocationContext = createContext<LocationContextProps>({
	updateUserLocation: async () => {},
});

export const LocationProvider = ({ children }: any) => {
	const updateUserLocation = async (
		userId: string,
		latitude: number,
		longitude: number,
	) => {
		const location = `POINT(${longitude} ${latitude})`;

		try {
			const { error } = await supabase
				.from("profiles")
				.eq("id", userId)
				.update({ location });

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error("Error updating user location: ", error);
		}
	};

	return (
		<LocationContext.Provider
			value={{
				updateUserLocation,
			}}
		>
			{children}
		</LocationContext.Provider>
	);
};
