import { NavigationContainer } from "@react-navigation/native";

import { ProtectedStack } from "./protected";
import { PublicStack } from "./public";

import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/stores/profileStore";

export function AppRoutes() {
	//const { user } = useAuth();
	const { profile } = useProfileStore();

	return (
		<NavigationContainer>
			{profile?.id ? <ProtectedStack /> : <PublicStack />}
		</NavigationContainer>
	);
}
