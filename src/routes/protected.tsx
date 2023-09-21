import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "@/screens/protected/Home";

type ProtectedStackParamList = {
	Home: undefined;
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
		</Stack.Navigator>
	);
}
