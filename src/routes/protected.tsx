import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "@/screens/protected/Home";
import Settings from "@/screens/protected/Settings";

export type ProtectedStackParamList = {
	Home: undefined;
	Settings: undefined;
};

const Stack = createNativeStackNavigator<ProtectedStackParamList>();

export function ProtectedStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="Home" component={Home} />
			<Stack.Screen name="Settings" component={Settings} />
		</Stack.Navigator>
	);
}
