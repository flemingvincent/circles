import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useCallback, useRef, useState, useEffect } from "react";
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
import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";
type ForgotPasswordProps = NativeStackScreenProps<
	PublicStackParamList,
	"ForgotPassword"
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

export function ForgotPassword({ navigation, route }: ForgotPasswordProps) {
	const email = route.params.email;
	const scrollRef = useAnimatedRef<ScrollView>();
	const alertRef = useRef<any>(null);
	const translateX = useSharedValue(0);
	const { forgotPassword } = useAuth();

	// The following two variables and functions are used to automatically focus the inputs.
	type TextInputRef = React.RefObject<TextInput>;
	const textInputRefs: TextInputRef[] = [
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
			trigger("code").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 1) {
			trigger("password").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 2) {
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
			code: z
				.string({
					required_error: "Oops! A code is required.",
				})
				.regex(/^[0-9]+$/, "Oops! Only numbers allowed.")
				.min(6, "Oops! 6 digits are required."),
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
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const { code, password } = data;

			await forgotPassword(email, code, password);
		} catch (error) {
			console.log("Supabase Reset Password Error: ", error);
			alertRef.current?.showAlert({
				title: "Oops!",
				// @ts-ignore
				message: error.message + ".",
				variant: "error",
			});
		}
	}

	const rResendCodeStyle = useAnimatedStyle(() => {
		return {
			opacity:
				activeIndex.value === 0
					? withTiming(1, {
							duration: 350,
					  })
					: withTiming(0, {
							duration: 350,
					  }),
			transform: [
				{
					translateY: withTiming(activeIndex.value === 0 ? 0 : 36, {
						duration: 350,
					}),
				},
			],
		};
	});

	const handleResendForgetPassword =async () => {
		try {
			const { error: resetPasswordError } =
				await supabase.auth.resetPasswordForEmail(email);
				
			if(resetPasswordError){
				console.log("Error");
				throw resetPasswordError;
			} else {
				console.log("Resending Email");
				alertRef.current?.showAlert({
					title: "Success!",
					message: "Verification code sent.",
					variant: "success",
				});
			}

		} catch (error) {
			console.log("Supabase forgot password error: ", error);
			alertRef.current?.showAlert({
				title: "Oops!",
				// @ts-ignore
				message: error.message + ".",
				variant: "error",
			});
		}
		
	}

	useEffect(() => {
		setTimeout(() => {
			alertRef.current?.showAlert({
				title: "Success!",
				message: "Verification code sent.",
				variant: "success",
			});
		}, 500);
	}, []);


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
					{[0, 1, 2].map((index) => (
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
					{/* Code Verification */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							Verification
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Enter the six digit code sent to{" "}
							<Text
								variant="callout"
								weight="semibold"
								style={tw`text-content-primary`}
							>
								{email}
							</Text>
						</Text>
						<Controller
							control={control}
							name="code"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[0]}
									placeholder="Six Digit Code"
									error={errors.code?.message}
									value={value}
									onChangeText={onChange}
									maxLength={6}
									keyboardType="number-pad"
								/>
							)}
						/>
					</View>
					{/* Password */}
					<View style={tw`w-[${SCREEN_WIDTH}px] px-12`}>
						<Text variant="title1" weight="semibold" style={tw`mb-4`}>
							New Password
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
									ref={textInputRefs[1]}
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
							Enter your new password again to successfuly reset it.
						</Text>
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field: { onChange, value } }) => (
								<Input
									ref={textInputRefs[2]}
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
					<Text
						variant="body"
						weight="semibold"
						style={[
							tw`text-content-secondary mb-4 text-center`,
							rResendCodeStyle,
						]}
						onPress={ ()=> {
							handleResendForgetPassword();
						}}
					>
						Didn't receive a code?
					</Text>

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
