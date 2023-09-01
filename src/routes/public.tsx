import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Welcome from "@/screens/public/Welcome";
import Login from "@/screens/public/Login";

export type PublicStackParamList = {
	Welcome: undefined;
	Login: undefined;
};

const Stack = createNativeStackNavigator<PublicStackParamList>();

export function PublicStack() {
	return (
		<Stack.Navigator initialRouteName="Welcome">
			<Stack.Screen name="Welcome" component={Welcome} />
			<Stack.Screen name="Login" component={Login} />
		</Stack.Navigator>
	);
}
