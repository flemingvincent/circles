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
	const alertRef = useRef<any>(null);
	const translateX = useSharedValue(0);
	const { login } = useAuth();

	// The following two variables and functions are used to automatically focus the inputs.
	type TextInputRef = React.RefObject<TextInput>;
	const textInputRefs: TextInputRef[] = [
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
					openNextTextInput();
				}
			});
		}

		if (activeIndex.value === 1) {
			trigger("password").then((isValid) => {
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
			const { email, password } = data;

			await login(email, password);
		} catch (error) {
			console.log("Firebase authorization error: ", error);
			alertRef.current?.showAlert({
				title: "Oops!",
				message: "Something went wrong.",
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
									ref={textInputRefs[0]}
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
									ref={textInputRefs[1]}
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
