import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View, Linking, AppState } from "react-native";
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
	const [locationPermissionStatus, setLocationPermissionStatus] =
		useState("undetermined");

	const mapRef = useRef<MapView>(null);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const permissionsModalRef = useRef<BottomSheetModal>(null);
	// Used to track if user navigates away from the app and returns.
	const appStateRef = useRef(AppState.currentState);

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
			},
		);
	};

	// Displays an in-app popup regarding location services.
	const requestPermissionsAndUpdateScreen = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		updateModalAndPossiblyAnimateMap(status);
	};

	// Checks location services in the background. This is needed if a user
	// goes to the settings page and returns back to the app.
	const checkPermissionsAndUpdateScreen = async () => {
		const { status } = await Location.getForegroundPermissionsAsync();
		updateModalAndPossiblyAnimateMap(status);
	};

	// Either displays the modal or begins the map animation process.
	const updateModalAndPossiblyAnimateMap = (
		status: Location.PermissionStatus,
	) => {
		setLocationPermissionStatus(status);
		if (status === "granted") {
			permissionsModalRef.current?.dismiss();
			getCurrPositionAndAnimateMap();
		} else {
			permissionsModalRef.current?.present();
		}
	};

	const getCurrPositionAndAnimateMap = async () => {
		try {
			const location = await Location.getCurrentPositionAsync({});
			setLocation(location);

			handleMapAnimation(location);

			initializeLocationWatcher();
		} catch (error) {
			console.log("error", error);
		}
	};

	// A listener that detects when a user returns/leaves the app.
	const initializeAppStateListener = () => {
		AppState.addEventListener("change", async (nextAppState) => {
			if (
				appStateRef.current.match(/inactive|background/) &&
				nextAppState === "active"
			) {
				// App has come to the foreground. Update the screen
				// in case permissions have been updated.
				await checkPermissionsAndUpdateScreen();
			}
			appStateRef.current = nextAppState;
		});
	};

	useEffect(() => {
		(async () => {
			checkPermissionsAndUpdateScreen();
			initializeAppStateListener();
		})();
	}, []);

	const showGoToSettingsModal = locationPermissionStatus === "denied";
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
				handleIndicatorStyle={
					showGoToSettingsModal ? tw`bg-border` : tw`bg-transparent`
				}
				backdropComponent={CustomBackdrop}
				enablePanDownToClose={!!showGoToSettingsModal}
			>
				<Image
					source={
						showGoToSettingsModal
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
						{showGoToSettingsModal
							? " Head over to your device settings to enable. "
							: " This will let you share your whereabouts with friends. "}
						Dont worry, your location is only visible to circles you're part of,
						and you can turn it off whenever you want.
					</Text>
					<Button
						variant={showGoToSettingsModal ? "secondary" : "primary"}
						label={showGoToSettingsModal ? "Go to Settings" : "Enable"}
						onPress={
							showGoToSettingsModal
								? Linking.openSettings
								: requestPermissionsAndUpdateScreen
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
