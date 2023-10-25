import { NavigationContainer } from "@react-navigation/native";

import { ProtectedStack } from "./protected";
import { PublicStack } from "./public";

import { useAuth } from "@/hooks/useAuth";

export function AppRoutes() {
	const { user } = useAuth();

	return (
		<NavigationContainer>
			{user ? <ProtectedStack /> : <PublicStack />}
		</NavigationContainer>
	);
}
