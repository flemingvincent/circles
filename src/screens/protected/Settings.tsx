import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { View, TouchableOpacity, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";

type SettingsProps = NativeStackScreenProps<PublicStackParamList, "Settings">;

const DATA = [
	{
		title: "Account",
		data: ["Username", "Email", "Password", "Profile Picture"],
	},
	{
		title: "Permissions",
		data: ["Location", "Notifications"],
	},
];

export default function Settings({ navigation }: SettingsProps) {
	const { logout } = useAuth();
	return (
		<SafeAreaView style={tw`flex-1 bg-white py-0 px-4`}>
			<View>
				<View
					style={tw`flex-row items-center justify-center gap-x-1 pt-4 pb-6 px-4 relative`}
				>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={tw`absolute left-0 top-3`}
					>
						<Image
							source={require("@/assets/icons/x-symbol.svg")}
							style={tw`w-5 h-5 rounded-full`}
						/>
					</TouchableOpacity>

					<Text variant="callout" weight="semibold" style={tw`mb-6`}>
						Settings
					</Text>
				</View>

				<View style={tw`px-0 pl-4 mt--6 h-screen`}>
					<SectionList
						sections={DATA}
						keyExtractor={(item, index) => item + index}
						renderItem={({ item, index, section }) => (
							<View>
								<TouchableOpacity>
									<View style={tw`flex-row`}>
										<Text
											variant="title2"
											weight="semibold"
											style={tw`text-content-primary mb-4`}
										>
											{item}
										</Text>
										<Image
											source={require("@/assets/icons/icon-right.svg")}
											style={tw`w-5 h-5 rounded-full mt-1 absolute right-0`}
										/>
									</View>
								</TouchableOpacity>
								{index !== section.data.length - 1 && (
									<View style={tw`h-0.1 bg-gray-500 mb-2`} />
								)}
							</View>
						)}
						renderSectionHeader={({ section: { title } }) => (
							<Text
								variant="subheadline"
								weight="semibold"
								style={tw`text-content-secondary mb-4 mt-6`}
							>
								{title}
							</Text>
						)}
						stickySectionHeadersEnabled={false}
					/>
				</View>
				<Button
					variant="secondary"
					label="Logout"
					style={tw`absolute top-160`}
					onPress={logout}
					// loading={isSubmitting}
				/>
			</View>
		</SafeAreaView>
	);
}
