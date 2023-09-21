import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import MapView from "react-native-maps";

import { CustomBackdrop } from "@/components/sheet/CustomBackdrop";
import { Button, Text } from "@/components/ui";
import tw from "@/lib/tailwind";

export default function Home() {
	const permissionsModalRef = useRef<BottomSheetModal>(null);

	const permissionSnapPoints = useMemo(() => ["60%"], []);

	useEffect(() => {
		permissionsModalRef.current?.present();
	}, []);

	return (
		<View style={tw`flex-1`}>
			<MapView style={tw`flex-1`} userInterfaceStyle="light" />
			<BottomSheetModal
				ref={permissionsModalRef}
				snapPoints={permissionSnapPoints}
				detached
				bottomInset={Platform.OS === "ios" ? 50 : 16}
				style={tw`mx-4`}
				backgroundStyle={tw`rounded-[2.25rem]`}
				handleStyle={tw`absolute self-center`}
				handleIndicatorStyle={tw`bg-border`}
				backdropComponent={CustomBackdrop}
				enablePanDownToClose={false}
			>
				<Image
					source={require("@/assets/images/location-services.svg")}
					style={tw`flex-1 rounded-t-[2.25rem]`}
				/>
				<View style={tw`px-8 py-6`}>
					<Text variant="title2" weight="semibold" style={tw`mb-4`}>
						Enable Location Services
					</Text>
					<Text
						variant="callout"
						weight="medium"
						style={tw`text-content-secondary mb-6`}
					>
						To enhance your experience, we recommend enabling location services.
						This will let you share your whereabouts with friends and family.
						Don't worry, your location is only visible to groups you're part of,
						and you can turn it off whenever you want.
					</Text>
					<Button label="Enable" />
				</View>
			</BottomSheetModal>
		</View>
	);
}
