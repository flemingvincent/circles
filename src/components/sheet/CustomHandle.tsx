import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { View, TouchableOpacity } from "react-native";

import { Avatar } from "../ui/Avatar";
import { Text } from "../ui/Text";

import tw from "@/lib/tailwind";
import { useProfileStore } from "@/stores/profileStore";

export interface HandleProps extends BottomSheetHandleProps {
	navigation?: any;
}

export const CustomHandle: React.FC<HandleProps> = ({ navigation }) => {
	const { profile } = useProfileStore();
	return (
		<View>
			<View
				style={tw`w-[1.8421875rem] h-[0.25rem] bg-[#e5e5e5] self-center rounded-full m-2.5`}
			/>
			<View style={tw`w-full flex-row items-center gap-x-2 mt-2 px-4`}>
				<Avatar avatar_url={profile?.avatar_url} />
				<View style={tw`flex-col flex-grow`}>
					<Text variant="headline" weight="semibold">
						{profile?.first_name} {profile?.last_name}
					</Text>
					<Text variant="subheadline" style={tw`text-content-secondary`}>
						@{profile?.username}
					</Text>
				</View>
				<TouchableOpacity onPress={() => navigation.navigate("Settings")}>
					<Image
						source={require("@/assets/icons/setting.svg")}
						style={tw`w-11 h-11 rounded-full`}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
};
