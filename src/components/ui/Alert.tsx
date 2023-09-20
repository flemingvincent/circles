import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import { View, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
	runOnJS,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	withSpring,
} from "react-native-reanimated";

import { Text } from "./Text";

import tw from "@/lib/tailwind";

export type AlertVariants = "default" | "error" | "success";

export interface IAlertProps {
	variant?: AlertVariants;
	title?: string;
	message?: string;
	duration?: number;
}

const { width } = Dimensions.get("window");
const defaultDuration = 3000;

export const Alert = React.forwardRef(({ ...props }, ref) => {
	const translateY = useSharedValue<number>(-100);
	const [isShown, setIsShown] = useState(false);
	const [variant, setVariant] = useState<AlertVariants>("default");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [duration, setDuration] = useState(defaultDuration);

	const showAlert = useCallback(
		({
			variant = "default",
			title = "",
			message = "",
			duration = defaultDuration,
		}: IAlertProps) => {
			setVariant(variant);
			setTitle(title);
			setMessage(message);
			setDuration(duration);
			setIsShown(true);
			translateY.value = withSequence(
				withTiming(60),
				withDelay(
					duration,
					withTiming(-100, undefined, (finish) => {
						if (finish) {
							runOnJS(setIsShown)(false);
						}
					}),
				),
			);
		},
		[translateY],
	);

	React.useImperativeHandle(
		ref,
		() => ({
			showAlert,
		}),
		[showAlert],
	);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			top: translateY.value,
		};
	});

	const gestureHandler = useAnimatedGestureHandler({
		onStart: (_, ctx: any) => {
			ctx.startY = translateY.value;
		},
		onActive: (event, ctx) => {
			if (event.translationY < 100) {
				translateY.value = withSpring(ctx.startY + event.translationY, {
					damping: 600,
					stiffness: 100,
				});
			}
		},
		onEnd: (event) => {
			if (event.translationY < 0) {
				translateY.value = withTiming(-100, undefined, (finish) => {
					if (finish) {
						runOnJS(setIsShown)(false);
					}
				});
			} else if (event.translationY > 0) {
				translateY.value = withSequence(
					withTiming(60),
					withDelay(
						duration,
						withTiming(-100, undefined, (finish) => {
							if (finish) {
								runOnJS(setIsShown)(false);
							}
						}),
					),
				);
			}
		},
	});

	return (
		<>
			{isShown && (
				<PanGestureHandler onGestureEvent={gestureHandler}>
					<Animated.View
						style={[
							tw`absolute w-[${
								width * 0.65
							}px] flex flex-row gap-x-2 items-center rounded-full z-20 px-4 h-12 self-center bg-white`,
							{
								shadowColor: "#000",
								shadowOffset: {
									width: 0,
									height: 2,
								},
								shadowOpacity: 0.25,
								shadowRadius: 3.84,
								elevation: 5,
							},
							animatedStyle,
						]}
					>
						{variant === "default" && (
							<Image
								source={require("@/assets/icons/circle-alert.svg")}
								style={[tw`w-6 h-6`]}
							/>
						)}
						{variant === "error" && (
							<Image
								source={require("@/assets/icons/circle-alert-red.svg")}
								style={[tw`w-6 h-6`]}
							/>
						)}
						{variant === "success" && (
							<Image
								source={require("@/assets/icons/circle-check-green.svg")}
								style={[tw`w-6 h-6`]}
							/>
						)}
						<View style={tw`flex-1`}>
							{title && (
								<Text variant="footnote" weight="semibold">
									{title}
								</Text>
							)}
							<Text
								variant="footnote"
								weight="medium"
								style={tw`text-content-secondary`}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{message}
							</Text>
						</View>
					</Animated.View>
				</PanGestureHandler>
			)}
		</>
	);
});
