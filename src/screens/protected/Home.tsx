import BottomSheet, {
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View, Linking, AppState } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../../../src/components/ui/Avatar";

import { CustomMarker } from "@/components/map/CustomMarker";
import { CustomBackdrop, CustomHandle, HandleProps } from "@/components/sheet";
import { Button, Text } from "@/components/ui";
import { useLocation } from "@/hooks/useLocation";
import tw from "@/lib/tailwind";
import { ProtectedStackParamList } from "@/routes/protected";
import { useProfileStore } from "@/stores/profileStore";
import { Status } from "@/types/profile";

type HomeProps = NativeStackScreenProps<ProtectedStackParamList, "Home">;

// TODO: Remove these dummy datas when we hook it up to the db.
const dummyCircles = [
	{ key: "1", value: "Family" },
	{ key: "2", value: "OS Study Group" },
	{ key: "3", value: "DSA Study Group" },
	{ key: "4", value: "BBall" },
	{ key: "5", value: "Buddies" },
];
const dummyStatus1: Status = "active";
const dummyStatus2: Status = "away";
const dummyProfiles = [
	{
		avatar_url:
			"https://cdn.britannica.com/79/232779-050-6B0411D7/German-Shepherd-dog-Alsatian.jpg",
		email: "test@test.com",
		first_name: "test1",
		id: "1",
		last_name: "test1",
		status: dummyStatus1,
		username: "test1",
	},
	{
		avatar_url:
			"https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Florida_Gators_gator_logo.svg/800px-Florida_Gators_gator_logo.svg.png",
		email: "test@test.com",
		first_name: "test2",
		id: "2",
		last_name: "test2",
		status: dummyStatus2,
		username: "test2",
	},
	{
		avatar_url:
			"https://di-uploads-pod14.dealerinspire.com/kingsford/uploads/2018/07/ford-trucks-0301.jpg",
		email: "test@test.com",
		first_name: "test3",
		id: "3",
		last_name: "test3",
		status: dummyStatus1,
		username: "test3",
	},
	{
		avatar_url:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juvenile_Ragdoll.jpg/800px-Juvenile_Ragdoll.jpg",
		email: "test@test.com",
		first_name: "test4",
		id: "4",
		last_name: "test4",
		status: dummyStatus2,
		username: "test4",
	},
	{
		avatar_url:
			"https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABYxJFBDckfZw1YUEIPwyuIg43Kw_HUBLvnCcgdOlvvf5Nc90SF3HSAi5L8uLyBqjziKBY-kGD2wu2JAqVsdHVR0frb6qG26I_U5v.jpg?r=77f",
		email: "test@test.com",
		first_name: "test5",
		id: "5",
		last_name: "test5",
		status: dummyStatus1,
		username: "test5",
	},
	{
		avatar_url:
			"https://static.www.nfl.com/image/private/t_headshot_desktop/league/q7dpdlxyu5rs05rgh1le",
		email: "test@test.com",
		first_name: "test6",
		id: "6",
		last_name: "test6",
		status: dummyStatus2,
		username: "test6",
	},
	{
		avatar_url:
			"https://static.wikia.nocookie.net/supermarioworld/images/b/bd/Jumpman_by_faren916-d4nqtjv.png/revision/latest/thumbnail/width/360/height/360?cb=20180115140600",
		email: "test@test.com",
		first_name: "test7",
		id: "7",
		last_name: "test7",
		status: dummyStatus1,
		username: "test7",
	},
	{
		avatar_url:
			"https://www.thedesignwork.com/wp-content/uploads/2011/10/Random-Pictures-of-Conceptual-and-Creative-Ideas-02.jpg",
		email: "test@test.com",
		first_name: "test7",
		id: "8",
		last_name: "test8",
		status: dummyStatus2,
		username: "test8",
	},
	{
		avatar_url:
			"https://i1.sndcdn.com/avatars-000508491087-32hktm-t240x240.jpg",
		email: "test@test.com",
		first_name: "test8",
		id: "9",
		last_name: "test9",
		status: dummyStatus1,
		username: "test9",
	},
	{
		avatar_url:
			"https://www.thisiscolossal.com/wp-content/uploads/2017/04/MatRandom_12.jpg",
		email: "test@test.com",
		first_name: "test9",
		id: "10",
		last_name: "test10",
		status: dummyStatus2,
		username: "test10",
	},
	{
		avatar_url: "https://img-9gag-fun.9cache.com/photo/a3Q5VW5_460s.jpg",
		email: "test@test.com",
		first_name: "test10",
		id: "11",
		last_name: "test11",
		status: dummyStatus1,
		username: "test11",
	},
];
const circleProfileMappings = [
	{ profileId: "1", circleKey: "1" },
	{ profileId: "2", circleKey: "2" },
	{ profileId: "3", circleKey: "3" },
	{ profileId: "4", circleKey: "4" },
	{ profileId: "5", circleKey: "5" },
	{ profileId: "6", circleKey: "1" },
	{ profileId: "7", circleKey: "2" },
	{ profileId: "8", circleKey: "3" },
	{ profileId: "9", circleKey: "4" },
	{ profileId: "10", circleKey: "5" },
	{ profileId: "11", circleKey: "1" },
];
const profileLocationMappings = [
	{
		profileId: "1",
		location: {
			accuracy: 35,
			altitude: 54.14205741882325,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.63673132384871,
			longitude: -82.3275647548498,
			speed: -1,
		},
	},
	{
		profileId: "2",
		location: {
			accuracy: 35,
			altitude: 54.14205741882326,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.65673132384871,
			longitude: -82.337564754849,
			speed: -1,
		},
	},
	{
		profileId: "3",
		location: {
			accuracy: 35,
			altitude: 54.14205741882327,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.63673132384871,
			longitude: -82.3375647548491,
			speed: -1,
		},
	},
	{
		profileId: "4",
		location: {
			accuracy: 35,
			altitude: 54.14205741882328,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.62673132384871,
			longitude: -82.3375647548492,
			speed: -1,
		},
	},
	{
		profileId: "5",
		location: {
			accuracy: 35,
			altitude: 54.14205741882329,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.66673132384871,
			longitude: -82.3375647548493,
			speed: -1,
		},
	},
	{
		profileId: "6",
		location: {
			accuracy: 35,
			altitude: 54.1420574188233,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.67673132384871,
			longitude: -82.3375647548494,
			speed: -1,
		},
	},
	{
		profileId: "7",
		location: {
			accuracy: 35,
			altitude: 54.14205741882323,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.64673132384871,
			longitude: -82.3275647548495,
			speed: -1,
		},
	},
	{
		profileId: "8",
		location: {
			accuracy: 35,
			altitude: 54.14205741882322,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.64673132384871,
			longitude: -82.3475647548496,
			speed: -1,
		},
	},
	{
		profileId: "9",
		location: {
			accuracy: 35,
			altitude: 54.14205741882321,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.65873132384871,
			longitude: -82.3475647548497,
			speed: -1,
		},
	},
	{
		profileId: "10",
		location: {
			accuracy: 35,
			altitude: 54.1420574188232,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.65873132384871,
			longitude: -82.3275647548497,
			speed: -1,
		},
	},
	{
		profileId: "11",
		location: {
			accuracy: 35,
			altitude: 54.14205741882319,
			altitudeAccuracy: 16.10590171813965,
			heading: -1,
			latitude: 29.64673132384871,
			longitude: -82.3275647548498,
			speed: -1,
		},
	},
];
export default function Home({ navigation }: HomeProps) {
	const { profile } = useProfileStore();
	const insets = useSafeAreaInsets();

	const customHandleProps: HandleProps = {
		navigation,
		animatedIndex: {
			value: 0,
		},
		animatedPosition: {
			value: 0,
		},
	};

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

	const showGoToSettingsModal = locationPermissionStatus === "denied";

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

	const { updateUserLocation } = useLocation();

	const updateLocationInDatabase = (location: Location.LocationObject) => {
		if (location) {
			// Function to update user location in database
			const { latitude, longitude } = location.coords;

			const userId = profile?.id;

			if (!userId) {
				console.error("User ID not found. Unable to update location.");
				return;
			}

			updateUserLocation(userId, latitude, longitude)
				.then(() => {
					console.log("User location updated successfully.");
				})
				.catch((error) => {
					console.error("Error updating user location:", error);
				});
		}
	};

	const getCurrPositionAndAnimateMap = async () => {
		try {
			const location = await Location.getCurrentPositionAsync({});
			setLocation(location);
			updateLocationInDatabase(location);
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

	const [profileIdsInCurrentCircle, setProfileIdsInCurrentCircle] = useState<
		string[]
	>([]);
	const createMapMarkersForUsersInCurrentCircle = () => {
		const usersInCircle: any[] = [];

		// Retrieve user details for each profile ID
		profileIdsInCurrentCircle.forEach((profileId) => {
			// TODO: Get a user's information, given their id, from the db
			const user = dummyProfiles.find((profile) => profile.id === profileId);

			if (user) {
				// TODO: Get a user's location from the db
				const userLocation = profileLocationMappings.find(
					(mapping) => mapping.profileId === user.id,
				);
				usersInCircle.push(
					<CustomMarker
						location={userLocation?.location}
						avatar_url={user?.avatar_url}
						status={user?.status}
					/>,
				);
			}
		});

		return usersInCircle;
	};
	const createListForUsersInCurrentCircle = () => {
		const usersInCircle: any[] = [];

		// Retrieve user details for each profile ID
		profileIdsInCurrentCircle.forEach((profileId) => {
			// TODO: Get a user's information, given their id, from the db
			const user = dummyProfiles.find((profile) => profile.id === profileId);

			if (user) {
				// TODO: Get a user's location from the db
				usersInCircle.push(
					<View style={tw`mt-3`}>
						<View style={tw`w-full flex-row items-center gap-x-2 mt-2 px-4`}>
							<Avatar avatar_url={user?.avatar_url} status={user?.status} />
							<View style={tw`flex-col flex-grow`}>
								<View style={tw`flex-row flex-grow`}>
									<Text variant="headline" weight="semibold">
										{user?.first_name} {user?.last_name}
									</Text>
									<Text
										variant="subheadline"
										style={tw`text-content-secondary`}
									>
										@{user?.username}
									</Text>
								</View>
								<View>
									<Text
										variant="subheadline"
										style={tw`text-content-secondary`}
									>
										{user?.status}
									</Text>
								</View>
							</View>
						</View>
					</View>,
				);
			}
		});

		return usersInCircle;
	};

	type Circle = {
		key: string;
		value: string;
		disabled?: boolean;
	};
	const [userCircles, setUserCircles] = useState<Circle[]>([]);
	const getUsersCircles = async () => {
		// TODO: Get user's circles from db.
		const usersCircles = dummyCircles;
		setUserCircles(usersCircles);
	};

	const updateProfileIdsInCurrentCircle = async () => {
		const circleKey = dummyCircles.find(
			(circle) => circle.value === selectedCircle,
		)?.key;

		// TODO: Get all the ids of all the profiles that are currently in `circleKey` from the db
		const profilesInCircle = circleProfileMappings
			.filter((mapping) => mapping.circleKey === circleKey)
			.map((obj) => obj.profileId);

		setProfileIdsInCurrentCircle(profilesInCircle);
	};

	const [selectedCircle, setSelectedCircle] =
		useState<SetStateAction<string>>("");
	useEffect(() => {
		updateProfileIdsInCurrentCircle();
	}, [selectedCircle]);

	useEffect(() => {
		(async () => {
			checkPermissionsAndUpdateScreen();
			initializeAppStateListener();
			getUsersCircles();
		})();
	}, []);

	const renderCircleButtons = () => {
		return (
			<View style={tw`px-12 gap-y-4`}>
				<Button
					variant="primary"
					label="Create a Circle"
					onPress={() => {
						navigation.navigate("Create");
					}}
				/>
				<Button
					variant="outline"
					label="Join a Circle"
					onPress={() => {
						navigation.navigate("Join");
					}}
				/>
			</View>
		);
	};
	return (
		<View style={tw`flex-1`}>
			<MapView
				ref={mapRef}
				style={tw`flex-1`}
				userInterfaceStyle="light"
				pitchEnabled={false}
			>
				{/* Current User's Marker */}
				{location && (
					<CustomMarker
						location={location.coords}
						avatar_url={profile?.avatar_url}
						status={profile?.status}
					/>
				)}
				{/* Markers For Users In The Current Circle */}
				{selectedCircle && createMapMarkersForUsersInCurrentCircle()}
			</MapView>
			<View
				style={tw`absolute top-15 self-center`}
				onTouchStart={() => "style={tw`absolute top-15 self-center`}"}
			>
				<SelectList
					search={false}
					boxStyles={tw`bg-white border-0 rounded-full shadow-lg items-center w-50`}
					dropdownStyles={tw`bg-white bg-white border-[1.5px] border-border w-full shadow-lg`}
					fontFamily="OpenRundeSemibold"
					setSelected={(selection: SetStateAction<string>) =>
						setSelectedCircle(selection)
					}
					data={userCircles}
					placeholder="Select a Circle"
					save="value"
				/>
			</View>
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
			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={bottomSheetSnapPoints}
				index={0}
				topInset={insets.top}
				handleComponent={() => CustomHandle(customHandleProps)}
				backgroundStyle={tw`rounded-t-[2.25rem]`}
			>
				{/* EmptyState */}
				{!selectedCircle && (
					<BottomSheetView style={tw`flex-1 justify-center gap-y-6 py-4`}>
						<Image
							style={tw`h-1/3`}
							source={require("@/assets/images/join-or-create-circle.png")}
						/>
						<View style={tw`px-12 gap-y-4`}>
							<Text variant="title2" weight="semibold" style={tw`text-center`}>
								Let's get you started!
							</Text>
							<Text
								variant="body"
								weight="medium"
								style={tw`text-center text-content-secondary`}
							>
								Create your own circle or join one to get started.
							</Text>
						</View>
						{renderCircleButtons()}
					</BottomSheetView>
				)}
				{/* Circle Selected */}
				{selectedCircle && (
					<View
						// flex-1 justify-center gap-y-6 py-4
						style={tw`flex-1 justify-between m-3`}
					>
						<View>
							<Text
								variant="subheadline"
								weight="semibold"
								style={tw`ml-3 mt-3`}
							>
								{selectedCircle.toString()}
							</Text>
							{createListForUsersInCurrentCircle()}
						</View>
						{renderCircleButtons()}
					</View>
				)}
			</BottomSheet>
		</View>
	);
}
