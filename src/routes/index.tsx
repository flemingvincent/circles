import { NavigationContainer } from "@react-navigation/native";

import { ProtectedStack } from "@/routes/protected";
import { PublicStack } from "@/routes/public";

export function AppRoutes() {
	return (
		<NavigationContainer>
			{/* {isLoggedIn ? <ProtectedStack /> : <PublicStack />} */}
			<PublicStack />
			{/* <ProtectedStack /> */}
		</NavigationContainer>
	);
}
