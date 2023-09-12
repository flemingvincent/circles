import { NavigationContainer } from "@react-navigation/native";

import { ProtectedStack } from "./protected";
import { PublicStack } from "./public";

export function AppRoutes() {
	return (
		<NavigationContainer>
			{/* {isLoggedIn ? <ProtectedStack /> : <PublicStack />} */}
			<PublicStack />
			{/* <ProtectedStack /> */}
		</NavigationContainer>
	);
}
