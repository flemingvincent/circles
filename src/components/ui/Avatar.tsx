import { Image } from "expo-image";
import React from "react";
import { Platform, View } from "react-native";

import tw from "@/lib/tailwind";
import { Status } from "@/types/profile";

interface IAvatarProps {
	avatar_url: string | null | undefined;
	status?: Status | null | undefined;
	style?: Image["props"]["style"];
}

export const Avatar = ({
	avatar_url,
	status = "offline",
	style,
}: IAvatarProps) => {
	return (
		<View>
			<View style={[tw`rounded-full overflow-hidden`]}>
				<Image
					source={
						avatar_url
							? { uri: avatar_url }
							: require("@/assets/icons/avatar.svg")
					}
					style={[tw`w-11 h-11 rounded-full`, style]}
				/>
			</View>
			<View
				style={[
					tw`absolute top-[-1] left-[-1] w-[1.125rem] h-[1.125rem] rounded-full border-2 border-white`,
					Platform.OS === "android" && tw`top-0 left-0`,
					status === "active" && tw`bg-green-500`,
					status === "away" && tw`bg-yellow-500`,
					status === "busy" && tw`bg-red-500`,
					status === "offline" && tw`bg-gray-500`,
				]}
			/>
		</View>
	);
};
