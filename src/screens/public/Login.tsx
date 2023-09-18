import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
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

import { Button, Input, Text } from "@/components/ui";
import { _signInWithEmailAndPassword } from "@/firebase/auth-wrapper";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";

type LoginProps = NativeStackScreenProps<PublicStackParamList, "Login">;

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
				activeIndex.value === index ? "#222222" : "#D9D9D9",
			),
		};
	});

	return (
		<Animated.View
			style={[tw`h-[0.1875rem] bg-red-500 rounded-full`, rIndicatorStyle]}
		/>
	);
};

export function Login({ navigation }: LoginProps) {
	const scrollRef = useAnimatedRef<ScrollView>();
	const translateX = useSharedValue(0);
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

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
			trigger("email").then((isValid) => {
				if (isValid) {
					scrollRef.current?.scrollTo({
						x: SCREEN_WIDTH * (activeIndex.value + 1),
					});
				}
			});
		}

		if (activeIndex.value === 1) {
			trigger("password").then((isValid) => {
				if (isValid) {
					console.log("submit");
					handleSubmit(onSubmit)();
				}
			});
		}
	}, []);

	const handleScrollBackward = useCallback(() => {
		if (activeIndex.value === 0) {
			navigation.goBack();
		}
		scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (activeIndex.value - 1) });
	}, []);

	const formSchema = z.object({
		email: z
			.string({
				required_error: "Oops! An email is required.",
			})
			.email("Oops! That's not an email."),
		password: z.string({
			required_error: "Oops! A password is required.",
		}),
	});

	const {
		control,
		handleSubmit,
		trigger,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {	
		try {
			// Firebase authentication
			const { email, password } = data; 
			// Calling wrapper function from auth-wrap
			await _signInWithEmailAndPassword(email, password);

			// TODO: Navigate to the next screen
			console.log("User signed in:", email);
		} catch (error) {
			console.error("Firebase authorization error: ", error);
		}
	}

	return (
		<SafeAreaView style={tw`flex-1 bg-white`}>
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
					{/* Map through two indicators*/}
					{[0, 1].map((index) => (
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
									placeholder="Email"
									description="Enter the email address associated with your account."
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
							Enter Password
						</Text>
						<Text
							variant="callout"
							weight="semibold"
							style={tw`text-content-secondary mb-6`}
						>
							Enter your password.
						</Text>
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
											hitSlop={24}
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
									description="Enter the password associated with your account."
									error={errors.password?.message}
									value={value}
									onChangeText={onChange}
									maxLength={64}
								/>
							)}
						/>
					</View>
				</Animated.ScrollView>
				<View style={tw`px-12`}>
					<Button
						variant="secondary"
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
