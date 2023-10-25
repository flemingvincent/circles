import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedStyle,
} from "react-native-reanimated";

export const CustomBackdrop = ({
	animatedIndex,
	style,
}: BottomSheetBackdropProps) => {
	// animated variables
	const containerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			animatedIndex.value,
			[-1, 0], // Adjusted interpolation range
			[0, 0.5], // Adjusted opacity values
			Extrapolate.CLAMP,
		),
	}));

	// styles
	const containerStyle = useMemo(
		() => [
			style,
			{
				backgroundColor: "#000000",
			},
			containerAnimatedStyle,
		],
		[style, containerAnimatedStyle],
	);

	return <Animated.View style={containerStyle} />;
};
