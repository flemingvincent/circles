import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { IProfile } from "@/types/profile";

export interface ProfileState {
	profile: IProfile | null;
	setProfile: (profile: IProfile) => void;
	removeProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
	persist(
		(set) => ({
			profile: null,
			setProfile: (profile) => set({ profile }),
			removeProfile: () => set({ profile: null }),
		}),
		{
			name: "profile-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
