import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	TextInput,
	View,
} from "react-native";
import Animated, {
	useAnimatedRef,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

import { Button, Input, Text, Alert } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";
type CreateAccountProps = NativeStackScreenProps<
	PublicStackParamList,
	"CreateAccount"
>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ScreenIndicator = ({
	activeIndex,
	index,
}: {
	activeIndex: Animated.SharedValue<number>;
	index: number;
}) => {
	const rIndicatorStyle = useAnimatedStyle(() => {
		return {
			width: withTiming(activeIndex.value === index ? 32 : 16),
			backgroundColor: withTiming(
				activeIndex.value === index ? "#4DAFFF" : "#D9D9D9",
			),
		};
	});

	return (
		<Animated.View
			style={[tw`h-[0.1875rem] bg-red-500 rounded-full`, rIndicatorStyle]}
		/>
	);
};

export function CreateAccount({ navigation }: CreateAccountProps) {
	const scrollRef = useAnimatedRef<ScrollView>();
	const alertRef = useRef<any>(null);
	const translateX = useSharedValue(0);
	const { createAccount } = useAuth();
	const { checkUsername } = useAuth();

	// The following two variables and functions are used to automatically focus the inputs.
	type TextInputRef = React.RefObject<TextInput>;
	const textInputRefs: TextInputRef[] = [
		useRef<TextInput>(null),
		useRef<TextInput>(null),
		useRef<TextInput>(null),
		useRef<TextInput>(null),
		useRef<TextInput>(null),
		useRef<TextInput>(null),
	];
	let currTextInput = 0;

	const openNextTextInput = () => {
		currTextInput += 1;
		textInputRefs[currTextInput]?.current?.focus();
	};

	const openPrevTextInput = () => {
		currTextInput -= 1;
		textInputRefs[currTextInput]?.current?.focus();
	};

	const [isUsernameAvailable, setIsUsernameAvailable] = useState<
		boolean | null
	>(null);
	const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
		null,
	);
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState<boolean>(false);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			translateX.value = event.contentOffset.x;
		},
	});

	const activeIndex = useDerivedValue(() => {
		return Math.round(translateX.value / SCREEN_WIDTH);
	});

	const handleScrollForward = useCallback(() => {
		if (activeIndex.value === 0) {
			trigger("firstName").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 1) {
			trigger("lastName").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 2) {
			// TODO: Check if username is available
			trigger("username").then((isValid) => {
				if (isValid) {
					let isUsernameAvailableFirebase:boolean = false;
					
					try {	
						checkUsername(getValues("username")).then((value) => {
							isUsernameAvailableFirebase = value;		
							
							if(isUsernameAvailableFirebase == true){
								clearErrors("username");				
							} else {					
								setError("username", {
									type: "manual",
									message: "Oops! That username is not available.",
								  });
							}

							setIsUsernameAvailable(isUsernameAvailableFirebase);

							if(isUsernameAvailableFirebase){
								scrollRef.current?.scrollTo({
									x: SCREEN_WIDTH * (activeIndex.value + 1),
								});
								openNextTextInput();
							}
						});			
						
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
		}

		if (activeIndex.value === 3) {
			// TODO: Check if email is available
			trigger("email").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 4) {
			trigger("password").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 5) {
			trigger("confirmPassword").then((isValid) => {
				if (isValid) {
					handleSubmit(onSubmit)();
				}
			});
		}
	}, []);

	const handleScrollBackward = useCallback(() => {
		if (activeIndex.value === 0) {
			navigation.goBack();
		}

		// Focus the previous text input
		openPrevTextInput();

		scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (activeIndex.value - 1) });
	}, []);

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
		handleSubmit,
		trigger,
		getValues,
		clearErrors,	
		setError,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const { email, password, username, firstName, lastName } = data;

			await createAccount(email, password, username, firstName, lastName);
		} catch (error) {
			// @ts-ignore
			console.log("Supabase SignUp Error: ", error);
			alertRef.current?.showAlert({
				title: "Oops!",
				// @ts-ignore
				message: error.message + ".",
				variant: "error",
			});
		}
	}
	return (
		<SafeAreaView style={tw`flex-1 bg-white`}>
			<Alert ref={alertRef} />
			<KeyboardAvoidingView
				style={tw`flex-1`}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View
					style={tw`flex-row items-center justify-center gap-x-1 pt-4 pb-6 px-4 relative`}
				>
					<Pressable
						style={tw`absolute left-4 top-1.5`}
						onPress={handleScrollBackward}
						hitSlop={24}
					>
						<Image
							source={require("@/assets/icons/arrow-left.svg")}
							style={tw`w-6 h-6`}
						/>
					</Pressable>
					{/* Map through six indicators*/}
					{[0, 1, 2, 3, 4, 5].map((index) => (
						<ScreenIndicator
							key={index.toString()}
							activeIndex={activeIndex}
							index={index}
						/>
					))}
				</View>
				<Animated.ScrollView
					ref={scrollRef as any}
					onScroll={scrollHandler}
					showsHorizontalScrollIndicator={false}
					scrollEnabled={false}
					scrollEventThrottle={8}
					horizontal
					pagingEnabled
					keyboardShouldPersistTaps="always"
					style={tw`flex-1`}
				>
					{/* First Name */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							First Name
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Enter your first name.
						</Text>
						<Controller
							control={control}
							name="firstName"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[0]}
									placeholder="First Name"
									description="Your name will be displayed on your profile."
									error={errors.firstName?.message}
									value={value}
									onChangeText={onChange}
									autoCapitalize="words"
								/>
							)}
						/>
					</View>
					{/* Last Name */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							Last Name
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Enter your last name.
						</Text>
						<Controller
							control={control}
							name="lastName"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[1]}
									placeholder="Last Name"
									description="Your name will be displayed on your profile."
									error={errors.lastName?.message}
									value={value}
									onChangeText={onChange}
									autoCapitalize="words"
								/>
							)}
						/>
					</View>
					{/* Username */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							Username
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Choose a username for your account.
						</Text>
						<Controller
							control={control}
							name="username"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[2]}
									placeholder="Username"
									description="Your username will be displayed on your profile."
									indicator={
										<View style={tw`flex-row items-center gap-x-2 mt-6`}>
											<Image
												source={
													isUsernameAvailable
														? require("@/assets/icons/circle-check-green.svg")
														: require("@/assets/icons/circle-check.svg")
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
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
					{/* Email */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							Email
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Enter your email address.
						</Text>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[3]}
									placeholder="Email"
									description="Your email address will be used to sign into your account."
									indicator={
										<View style={tw`flex-row items-center gap-x-2 mt-6`}>
											<Image
												source={
													isEmailAvailable
														? require("@/assets/icons/circle-check-green.svg")
														: require("@/assets/icons/circle-check.svg")
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
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>
					{/* Password */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							Choose Password
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Choose a strong password to secure your account.
						</Text>
						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[4]}
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
					{/* Confirm Password */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							Confirm Password
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Enter your password again to create your account.
						</Text>
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[5]}
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
					</View>
				</Animated.ScrollView>
				<View style={tw`px-12`}>
					<Button
						variant="primary"
						label="Continue"
						style={tw`mb-4`}
						onPress={handleScrollForward}
						loading={isSubmitting}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
