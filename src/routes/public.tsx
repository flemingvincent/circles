import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "@/screens/public/Login";
import Welcome from "@/screens/public/Welcome";

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
