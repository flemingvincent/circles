import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View, Linking } from "react-native";
import MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomMarker } from "@/components/map/CustomMarker";
import { CustomBackdrop, CustomHandle } from "@/components/sheet";
import { Button, Text } from "@/components/ui";
import tw from "@/lib/tailwind";
import { useProfileStore } from "@/stores/profileStore";

export default function Home() {
	const { profile } = useProfileStore();
	const insets = useSafeAreaInsets();

	const [location, setLocation] = useState<Location.LocationObject>();
	const [sharingLocationDenied, setSharingLocationDenied] = useState(false);

	const mapRef = useRef<MapView>(null);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const permissionsModalRef = useRef<BottomSheetModal>(null);

	const permissionSnapPoints = useMemo(() => ["64%"], []);
	const bottomSheetSnapPoints = useMemo(() => ["16%", "48%", "100%"], []);

	const handleMapAnimation = (location: Location.LocationObject) => {
		mapRef.current?.animateCamera(
			{
				center: {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
				},
				heading: 0,
				pitch: 0,
				zoom: 14,
				altitude: 20000,
			},
			{ duration: 1000 },
		);
	};

	const initializeLocationWatcher = async () => {
		await Location.watchPositionAsync(
			{
				distanceInterval: 75,
			},
			(newLocation) => {
				setLocation(newLocation);
				console.log("Location updated");
			},
		);
	};

	const handleLocationServices = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();

		if (status === "granted") {
			const location = await Location.getCurrentPositionAsync({});
			setLocation(location);

			permissionsModalRef.current?.dismiss();

			handleMapAnimation(location);

			initializeLocationWatcher();
		} else {
			setSharingLocationDenied(true);
		}
	};

	useEffect(() => {
		(async () => {
			const { status } = await Location.getForegroundPermissionsAsync();
			if (status === "undetermined") {
				permissionsModalRef.current?.present();
			} else if (status === "denied") {
				setSharingLocationDenied(true);
				permissionsModalRef.current?.present();
			} else {
				try {
					const location = await Location.getCurrentPositionAsync({});
					setLocation(location);

					handleMapAnimation(location);

					initializeLocationWatcher();
				} catch (error) {
					console.log("error", error);
				}
			}
		})();
	}, []);

	return (
		<View style={tw`flex-1`}>
			<MapView
				ref={mapRef}
				style={tw`flex-1`}
				userInterfaceStyle="light"
				pitchEnabled={false}
			>
				{location && (
					<CustomMarker
						location={location.coords}
						avatar_url={profile?.avatar_url}
					/>
				)}
			</MapView>
			{/* Permissions Modal */}
			<BottomSheetModal
				ref={permissionsModalRef}
				snapPoints={permissionSnapPoints}
				detached
				bottomInset={Platform.OS === "ios" ? 50 : 16}
				style={tw`mx-4`}
				backgroundStyle={tw`rounded-[2.25rem]`}
				handleStyle={tw`absolute self-center`}
				handleIndicatorStyle={sharingLocationDenied ? tw`bg-border`: tw`bg-transparent`}
				backdropComponent={CustomBackdrop}
				enablePanDownToClose={sharingLocationDenied ? true : false}
			>
				<Image
					source={
						sharingLocationDenied
							? require("@/assets/images/go-to-settings.png")
							: require("@/assets/images/enable-location-services.png")
					}
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
						{sharingLocationDenied
							? `Head over to your device settings to enable. Don't worry, ` +
							  `your location is only visible to circles you're part of, ` +
							  `and you can turn it off whenever you want.`
							: `This will let you share your whereabouts with friends. ` +
							  `Don't worry, your location is only visible to circles` +
							  `you're part of, and you can turn it off whenever you want.`}
					</Text>
					<Button
						label={sharingLocationDenied ? "Go to Settings" : "Enable"}
						onPress={
							sharingLocationDenied
								? () => {Linking.openSettings()}
								: handleLocationServices
						}
					/>
				</View>
			</BottomSheetModal>
			{/* Bottom Sheet */}
			{/* @ts-ignore */}
			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={bottomSheetSnapPoints}
				index={0}
				topInset={insets.top}
				handleComponent={CustomHandle}
				backgroundStyle={tw`rounded-t-[2.25rem]`}
			/>
		</View>
	);
}
