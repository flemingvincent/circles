import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
	View,
	TouchableOpacity,
	ScrollView,
	Pressable,
	Dimensions,
	TextInput,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import Animated, {
	useAnimatedRef,
	useAnimatedScrollHandler,
	useDerivedValue,
	useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

import { Text, Input, Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";
import { useProfileStore, ProfileState } from "@/stores/profileStore";
import { supabase } from "@/config/supabase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type SettingsProps = NativeStackScreenProps<PublicStackParamList, "Settings">;

const selectionOptions = [
	"Settings",
	"Username",
	"Email",
	"Password",
	"Profile Picture",
];

export default function Settings({ navigation }: SettingsProps) {
	const { updateUsername, updateUserEmail, updateUserPassword, logout } =
		useAuth();
	const [selectionIndex, setSelectionIndex] = useState(0);
	const { profile }: ProfileState = useProfileStore();
	const { checkUsernameAvailability, checkEmailAvailability } = useAuth();
	const textInputRef = useRef<TextInput>(null);
	

	const [isUsernameAvailable, setIsUsernameAvailable] = useState<
		boolean | null
	>(null);
	const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
		null,
	);
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState<boolean>(false);

	const defaultPic = require("@/assets/icons/avatar.svg");
	const [profileImage, setProfileImage] = useState(defaultPic);

	const scrollRef = useAnimatedRef<ScrollView>();
	const alertRef = useRef<any>(null);
	const translateX = useSharedValue(0);
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			translateX.value = event.contentOffset.x;
		},
	});

	async function updateUsernameAvailability() {
		// For simplicity and so the form looks pleasing off the bat,
		// the username availability is green if the username hasn't changed.
		if (getValues("username") === profile?.username) {
			setIsUsernameAvailable(true);
		} else {
			checkUsernameAvailability(getValues("username")).then(
				(isUsernameAvailable) => {
					setIsUsernameAvailable(isUsernameAvailable);
					updateUsername(getValues("username"));
				},
			);
		}
	}

	async function updateEmailAvailability() {
		// For simplicity and so the form looks pleasing off the bat,
		// the email availability is green if the email hasn't changed.
		if (getValues("email") === profile?.email) {
			setIsEmailAvailable(true);
		} else {
			checkEmailAvailability(getValues("email")).then((isEmailAvailable) => {
				setIsEmailAvailable(isEmailAvailable);
			});
		}
	}

	async function onSubmit() {
		if (selectionIndex === 1) {
			trigger("username").then((isValid) => {
				if (isValid) {
					try {
						updateUsernameAvailability();
					} catch (error) {
						// @ts-ignore
						console.log("Supabase Create Account Error: ", error);
						alertRef.current?.showAlert({
							title: "Oops!",
							// @ts-ignore
							message: error.message + ".",
							variant: "error",
						});
					}
				}
			});
		} else if (selectionIndex === 2) {
			trigger("email").then((isValid) => {
				if (isValid) {
					try {
						updateEmailAvailability();
						updateUserEmail(getValues("email"));
					} catch (error) {
						// @ts-ignore
						console.log("Supabase Create Account Error: ", error);
						alertRef.current?.showAlert({
							title: "Oops!",
							// @ts-ignore
							message: error.message + ".",
							variant: "error",
						});
					}
				}
			});
		} else if (selectionIndex === 3) {
			trigger("password").then((isValid1) => {
				if (isValid1) {
					trigger("confirmPassword").then((isValid2) => {
						if (isValid2) {
							updateUserPassword(getValues("password"));
							// TODO (change user password here)
						}
					});
				}
			});
		}
	}

	const formSchema = z
		.object({
			email: z
				.string({
					required_error: "Oops! An email is required.",
				})
				.email("Oops! That's not an email."),
			password: z
				.string({
					required_error: "Oops! A password is required.",
				})
				.min(10, "Oops! Enter at least 10 characters.")
				.regex(/^(?=.*[a-z])/, "Oops! Missing a lowercase letter.")
				.regex(/^(?=.*[A-Z])/, "Oops! Missing an uppercase letter.")
				.regex(/^(?=.*[0-9])/, "Oops! Missing a number.")
				.regex(/^(?=.*[!@#$%^&*])/, "Oops! Missing a special character."),
			confirmPassword: z.string({
				required_error: "Oops! A password is required.",
			}),
			firstName: z
				.string({
					required_error: "Oops! A first name is required.",
				})
				.trim()
				.regex(/^[a-zA-Z -]+$/, "Oops! That's not a valid name.")
				.transform((value) => value.replace(/\b\w/g, (c) => c.toUpperCase())),
			lastName: z
				.string({
					required_error: "Oops! A last name is required.",
				})
				.trim()
				.regex(/^[a-zA-Z -]+$/, "Oops! That's not a valid name.")
				.transform((value) => value.replace(/\b\w/g, (c) => c.toUpperCase())),
			username: z
				.string({
					required_error: "Oops! A username is required.",
				})
				.min(3, "Oops! Your username is too short.")
				.regex(
					/^(?=.*[a-zA-Z0-9])([a-zA-Z0-9_]+\.)*[a-zA-Z0-9_]+$/,
					"Oops! That's not a valid username.",
				)
				.max(20, "Oops! Your username is too long."),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Oops! Passwords don't match.",
			path: ["confirmPassword"],
		});

	const {
		control,
		trigger,
		getValues,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const activeIndex = useDerivedValue(() => {
		return Math.round(translateX.value / SCREEN_WIDTH);
	});

	const handleScrollForward = () => {
		scrollRef.current?.scrollTo({
			x: SCREEN_WIDTH * (activeIndex.value + 1),
		});
	};

	const handleScrollBackward = () => {
		if (selectionIndex === 0) {
			navigation.goBack();
		}
		setSelectionIndex(0);
		Keyboard.dismiss();
		reset();
		scrollRef.current?.scrollTo({ x: 0 });
	};
	const pickImage = async () => {
		try {
		  	const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 1,
			});
			if (!result.canceled) {
				const profileImageUri = result.assets[0].uri;
				setProfileImage(profileImageUri || defaultPic);
			}
		} catch (error) {
			console.error('Error picking image:', error);
		  	throw error; // Rethrow the error to handle it elsewhere if needed
		}
	};
	  
	const updateAvatar = async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				throw new Error('User not authenticated');
			}
	
			// Upload the new profile picture to the "avatars" bucket
			const { data, error: uploadError } = await supabase.storage
			  .from('avatars')
		      .upload(`user-${user?.id}.jpg`, profileImage, {
			  cacheControl: 'public, max-age=31536000', // Optional: Set cache control headers
		  	});
	  
			if (uploadError) {
				const { data, error: updateError } = await supabase.storage
			  	  .from('avatars')
		          .update(`user-${user?.id}.jpg`, profileImage, {
			      cacheControl: 'public, max-age=31536000', // Optional: Set cache control headers
		  		});
				if(updateError){
		  			console.error('Error updating profile picture:', uploadError.message);
				} else {
					console.log('Profile picture updated successfully:', JSON.stringify(profileImage));
			  	}
			} else {
				const userId = user.id;
				const newAvatar_url = `user-${user?.id}.jpg`;
				const { error: profileError } = await supabase
					.from('profiles')
					.update({ avatar_url: newAvatar_url})
					.eq('id', userId);
				
				if (profileError) {
					throw profileError;
				}
		  		console.log('Profile picture uploaded successfully:', JSON.stringify(profileImage));
			}
			
		} catch (error) {
		  console.error('Error updating profile picture:', error);
		  throw error; 
		}
	};

	return (
		<SafeAreaView style={tw`flex-1 bg-white`}>
			<KeyboardAvoidingView
				style={tw`flex-1`}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				{/* Title and back button */}
				<View
					style={tw`flex flex-row items-center justify-center w-full py-[0.6875rem]`}
				>
					<Pressable
						style={tw`absolute left-4`}
						hitSlop={24}
						onPress={handleScrollBackward}
					>
						<Image
							style={tw`w-6 h-6`}
							source={
								selectionIndex === 0
									? require("@/assets/icons/x.svg")
									: require("@/assets/icons/chevron-left-black.svg")
							}
						/>
					</Pressable>
					<Text variant="body" weight="semibold">
						{selectionOptions[selectionIndex]}
					</Text>
				</View>

				{/* Two horizontally oriented screens */}
				<Animated.ScrollView
					ref={scrollRef as any}
					onScroll={scrollHandler}
					showsHorizontalScrollIndicator={false}
					scrollEnabled={false}
					scrollEventThrottle={8}
					horizontal
					pagingEnabled
					style={tw`flex-1`}
				>
					{/* Screen One */}
					<View style={tw`flex-1 w-[${SCREEN_WIDTH}px] pt-6`}>
						<Text
							style={tw`text-content-secondary px-4`}
							variant="caption1"
							weight="semibold"
						>
							ACCOUNT
						</Text>
						<TouchableOpacity
							style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
							onPress={() => {
								// Set the index so we know to move horizontally and update the title.
								setSelectionIndex(1);
								// Set the username value of the form.
								setValue("username", profile?.username!);
								// Check the username availability right away.
								updateUsernameAvailability();
								// Finally, go to the screen.
								handleScrollForward();
							}}
						>
							<Text weight="semibold">Username</Text>
							<Image
								style={tw`w-6 h-6`}
								source={require("@/assets/icons/chevron-right-gray.svg")}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
							onPress={() => {
								// Set the index so we know to move horizontally and update the title.
								setSelectionIndex(2);
								// Set the username value of the form.
								setValue("email", profile?.email!);
								// Check the username availability right away.
								updateEmailAvailability();
								// Finally, go to the screen.
								handleScrollForward();
							}}
						>
							<Text weight="semibold">Email</Text>
							<Image
								style={tw`w-6 h-6`}
								source={require("@/assets/icons/chevron-right-gray.svg")}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
							onPress={() => {
								handleScrollForward();
								setSelectionIndex(3);
							}}
						>
							<Text weight="semibold">Password</Text>
							<Image
								style={tw`w-6 h-6`}
								source={require("@/assets/icons/chevron-right-gray.svg")}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={tw`flex flex-row justify-between w-full p-4 border-b border-b-border`}
							onPress={() => {
								handleScrollForward();
								setSelectionIndex(4);
							}}
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
						<TouchableOpacity
							style={tw`flex flex-row justify-between w-full p-4`}
						>
							<Text weight="semibold">Notifications</Text>
							<Image
								style={tw`w-6 h-6`}
								source={require("@/assets/icons/ellipsis-vertical.svg")}
							/>
						</TouchableOpacity>
					</View>

					{/* Screen Two. Technically, four screens, but only the selected one is shown */}

					{/* Profile Picture */}
					<View
						style={tw`flex items-center justify-center w-[${SCREEN_WIDTH}px] px-12 ${
							selectionIndex === 4 ? "" : "hidden"
						}`}
					>
						<View style={tw`w-[12.5rem] h-[12.5rem]`}>
							<Image
								// style={tw`w-[12.5rem] h-[12.5rem]`}
								style={tw`w-full h-full rounded-full overflow-hidden`}
								source={profileImage}
							/>
							<Pressable
								style={tw`absolute w-16 h-16 bottom-0 right-0 rounded-full bg-white shadow-md items-center justify-center`}
								onPress={() => pickImage()}
							>
								<Image
									style={tw`w-6 h-6`}
									source={require("@/assets/icons/edit.svg")}
								/>
							</Pressable>
						</View>
						<Button
							variant="secondary"
							label="Save"
							style={tw`bottom-4 absolute`}
							onPress={() => updateAvatar()}
							loading={isSubmitting}
						/>
					</View>

					{/* Passwords */}
					<View
						style={tw`w-[${SCREEN_WIDTH}px] px-12 pt-6 ${
							selectionIndex === 3 ? "" : "hidden"
						}`}
					>
						<View style={tw`mb-4`}>
							<Controller
								control={control}
								name="password"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="Password"
										icon={
											<Pressable
												onPress={() => {
													setIsPasswordVisible(!isPasswordVisible);
												}}
											>
												<Image
													source={
														isPasswordVisible
															? require("@/assets/icons/eye-close.svg")
															: require("@/assets/icons/eye.svg")
													}
													style={tw`w-6 h-6`}
												/>
											</Pressable>
										}
										secureTextEntry={!isPasswordVisible}
										description="Strong passwords consist of at least 10 characters and should include a combination of uppercase and lowercase letters, special characters, and numbers."
										error={errors.password?.message}
										value={value}
										onChangeText={onChange}
										maxLength={64}
										indicator={
											<View style={tw`flex-row items-center gap-x-2 mt-6`}>
												<Image
													style={tw`w-6 h-6`}
													source={
														getValues("password") === undefined ||
														getValues("password") === ""
															? require("@/assets/icons/bar.svg")
															: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{10,}$/.test(
																	getValues("password"),
															  )
															? require("@/assets/icons/bar-green.svg") // Strong password
															: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{10,}$/.test(
																	getValues("password"),
															  )
															? require("@/assets/icons/bar-yellow.svg") // Moderate password
															: /^.{8,}$/.test(getValues("password"))
															? require("@/assets/icons/bar-red.svg") // Weak password
															: require("@/assets/icons/bar-red.svg")
													}
												/>

												<Text
													variant="subheadline"
													weight="semibold"
													style={tw`text-content-tertiary`}
												>
													Password Strength
												</Text>
											</View>
										}
									/>
								)}
							/>
						</View>
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field: { onChange, value } }) => (
								<Input
									placeholder="Confirm Password"
									icon={
										<Pressable
											onPress={() => {
												setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
											}}
										>
											<Image
												source={
													isConfirmPasswordVisible
														? require("@/assets/icons/eye-close.svg")
														: require("@/assets/icons/eye.svg")
												}
												style={tw`w-6 h-6`}
											/>
										</Pressable>
									}
									secureTextEntry={!isConfirmPasswordVisible}
									description="In order to continue, re-enter your password exactly the same as before."
									error={errors.confirmPassword?.message}
									value={value}
									onChangeText={onChange}
									maxLength={64}
									indicator={
										<View style={tw`flex-row items-center gap-x-2 mt-6`}>
											<Image
												source={
													// Check if either password or confirmPassword is undefined or empty
													getValues("password") === undefined ||
													getValues("password") === "" ||
													getValues("confirmPassword") === undefined ||
													getValues("confirmPassword") === ""
														? require("@/assets/icons/circle-check.svg") // Show circle-check.svg
														: getValues("password") ===
														  getValues("confirmPassword")
														? require("@/assets/icons/circle-check-green.svg") // Show circle-check-green.svg
														: require("@/assets/icons/circle-check.svg")
												}
												style={tw`w-6 h-6`}
											/>
											<Text
												variant="subheadline"
												weight="semibold"
												style={tw`text-content-tertiary`}
											>
												Passwords Match
											</Text>
										</View>
									}
								/>
							)}
						/>
						<Button
							variant="secondary"
							label="Save"
							style={tw`absolute self-center bottom-4`}
							onPress={onSubmit}
							loading={isSubmitting}
						/>
					</View>

					{/* Email */}
					<View
						style={tw`w-[${SCREEN_WIDTH}px] px-12 pt-6 relative ${
							selectionIndex === 2 ? "" : "hidden"
						}`}
					>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRef}
									description="Your email address will be used to sign into your account."
									indicator={
										<View style={tw`flex-row items-center gap-x-2 mt-6`}>
											<Image
												source={
													isEmailAvailable === null
														? require("@/assets/icons/circle-check.svg")
														: isEmailAvailable
														? require("@/assets/icons/circle-check-green.svg")
														: require("@/assets/icons/circle-x-red.svg")
												}
												style={tw`w-6 h-6`}
											/>
											<Text
												variant="subheadline"
												weight="semibold"
												style={tw`text-content-tertiary`}
											>
												Email Available
											</Text>
										</View>
									}
									error={errors.email?.message}
									autoComplete="email"
									keyboardType="email-address"
									defaultValue={profile?.email}
									value={value}
									onChangeText={(e) => {
										setIsEmailAvailable(null);
										onChange(e);
									}}
									onSubmitEditing={onSubmit}
								/>
							)}
						/>
						<Button
							variant="secondary"
							label="Save"
							style={tw`absolute self-center bottom-4`}
							onPress={onSubmit}
							loading={isSubmitting}
						/>
					</View>

					{/* Username */}
					<View style={tw`flex w-[${SCREEN_WIDTH}px] px-12 pt-6 relative`}>
						<Controller
							control={control}
							name="username"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRef}
									description="Your username will be displayed on your profile."
									indicator={
										<View style={tw`flex-row items-center gap-x-2 mt-6`}>
											<Image
												source={
													isUsernameAvailable === null
														? require("@/assets/icons/circle-check.svg")
														: isUsernameAvailable
														? require("@/assets/icons/circle-check-green.svg")
														: require("@/assets/icons/circle-x-red.svg")
												}
												style={tw`w-6 h-6`}
											/>
											<Text
												variant="subheadline"
												weight="semibold"
												style={tw`text-content-tertiary`}
											>
												Username Available
											</Text>
										</View>
									}
									error={errors.username?.message}
									defaultValue={profile?.username}
									value={value}
									onChangeText={(e) => {
										setIsUsernameAvailable(null);
										onChange(e);
									}}
									onSubmitEditing={onSubmit}
								/>
							)}
						/>
						<Button
							variant="secondary"
							label="Save"
							style={tw`absolute self-center bottom-4`}
							onPress={onSubmit}
							loading={isSubmitting}
						/>
					</View>
				</Animated.ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
