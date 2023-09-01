import { NavigationContainer } from "@react-navigation/native";

import { PublicStack } from "@/routes/public";
import { ProtectedStack } from "@/routes/protected";

export function AppRoutes() {
	return (
		<NavigationContainer>
			{/* {isLoggedIn ? <ProtectedStack /> : <PublicStack />} */}
			<PublicStack />
			{/* <ProtectedStack /> */}
		</NavigationContainer>
	);
}
