import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Welcome, Login } from "@/screens/public";

export type PublicStackParamList = {
	Welcome: undefined;
	Login: undefined;
};

const Stack = createNativeStackNavigator<PublicStackParamList>();

export function PublicStack() {
	return (
		<Stack.Navigator
			initialRouteName="Welcome"
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="Welcome" component={Welcome} />
			<Stack.Screen
				name="Login"
				component={Login}
				options={{
					animation: "fade",
				}}
			/>
		</Stack.Navigator>
	);
}
