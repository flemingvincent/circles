import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Create from "@/screens/protected/Create";
import Home from "@/screens/protected/Home";
import Join from "@/screens/protected/Join";
import Settings from "@/screens/protected/Settings";

export type ProtectedStackParamList = {
	Home: undefined;
	Settings: undefined;
	Join: undefined;
	Create: undefined;
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
			<Stack.Screen name="Join" component={Join} />
			<Stack.Screen name="Create" component={Create} />
		</Stack.Navigator>
	);
}
