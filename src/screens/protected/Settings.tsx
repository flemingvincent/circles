import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { View, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";

type SettingsProps = NativeStackScreenProps<PublicStackParamList, "Settings">;

export default function Settings({ navigation }: SettingsProps) {
	const { logout } = useAuth();

	return (
		<SafeAreaView style={tw`flex-1 bg-white`}>
			<View
				style={tw`flex flex-row items-center justify-center w-full py-[0.6875rem]`}
			>
				<Pressable
					style={tw`absolute left-4`}
					hitSlop={24}
					onPress={() => {
						navigation.goBack();
					}}
				>
					<Image style={tw`w-6 h-6`} source={require("@/assets/icons/x.svg")} />
				</Pressable>
				<Text variant="body" weight="semibold">
					Settings
				</Text>
			</View>
			<ScrollView style={tw`flex-1 pt-6`} showsVerticalScrollIndicator={false}>
				<Text
					style={tw`text-content-secondary px-4`}
					variant="caption1"
					weight="semibold"
				>
					ACCOUNT
				</Text>
				<TouchableOpacity
					style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
				>
					<Text weight="semibold">Username</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/chevron-right-gray.svg")}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
				>
					<Text weight="semibold">Email</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/chevron-right-gray.svg")}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
				>
					<Text weight="semibold">Password</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/chevron-right-gray.svg")}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
				>
					<Text weight="semibold">Profile Picture</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/chevron-right-gray.svg")}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={tw`flex flex-row justify-between w-full p-4`}
					onPress={() => {
						logout();
					}}
				>
					<Text weight="semibold">Logout</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/logout-red.svg")}
					/>
				</TouchableOpacity>
				<Text
					style={tw`text-content-secondary mt-6 px-4`}
					variant="caption1"
					weight="semibold"
				>
					PERMISSIONS
				</Text>
				<TouchableOpacity
					style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
				>
					<Text weight="semibold">Location</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/ellipsis-vertical.svg")}
					/>
				</TouchableOpacity>
				<TouchableOpacity style={tw`flex flex-row justify-between w-full p-4`}>
					<Text weight="semibold">Notifications</Text>
					<Image
						style={tw`w-6 h-6`}
						source={require("@/assets/icons/ellipsis-vertical.svg")}
					/>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}
