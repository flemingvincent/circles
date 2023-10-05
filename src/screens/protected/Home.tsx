import BottomSheet, {
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
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

	const [location, setLocation] = useState<Location.LocationObject | null>();

	const mapRef = useRef<MapView>(null);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const permissionsModalRef = useRef<BottomSheetModal>(null);

	const permissionSnapPoints = useMemo(() => ["64%"], []);
	const bottomSheetSnapPoints = useMemo(() => ["16%", "48%", "100%"], []);

	const handleLocationServices = async () => {
		console.log("Requesting permissions");

		const { status } = await Location.requestForegroundPermissionsAsync();

		console.log("Permissions status:", status);

		if (status === "granted") {
			permissionsModalRef.current?.close();

			const location = await Location.getCurrentPositionAsync();
			setLocation(location);

			if (mapRef.current) {
				mapRef.current.animateCamera(
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
			}
		}

		permissionsModalRef.current?.close();
	};

	// Checking for permissions
	// If granted, get current location
	// Else, show permissions modal
	useEffect(() => {
		(async () => {
			const { status } = await Location.getForegroundPermissionsAsync();

			if (status === "granted") {
				const location = await Location.getCurrentPositionAsync();
				setLocation(location);

				if (mapRef.current) {
					mapRef.current.animateCamera(
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
				}
			} else {
				permissionsModalRef.current?.present();
			}
		})();
	}, []);

	// Watch for location changes
	useEffect(() => {
		if (location) {
			let locationWatcher: Location.LocationSubscription | null = null;

			(async () => {
				locationWatcher = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.Balanced,
						timeInterval: 5000,
						distanceInterval: 100,
					},
					(newLocation) => {
						setLocation(newLocation);
					},
				);
			})();

			return () => {
				if (locationWatcher) {
					locationWatcher.remove();
				}
			};
		}
	}, []);

	useEffect(() => {
		console.log(location);
	}, [location]);

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
					<Button label="Enable" onPress={handleLocationServices} />
				</View>
			</BottomSheetModal>
			{/* Bottom Sheet */}
			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={bottomSheetSnapPoints}
				index={0}
				topInset={insets.top}
				handleComponent={CustomHandle}
				backgroundStyle={tw`rounded-t-[2.25rem]`}
			>
				<BottomSheetView style={tw`p-4`}>
					<Text variant="body" weight="semibold">
						Circle Name
					</Text>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}
