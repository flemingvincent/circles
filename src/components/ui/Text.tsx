import { Text as RNText, TextProps as RNTextProps } from "react-native";
import Animated from "react-native-reanimated";

import tw from "@/lib/tailwind";

const AnimatedText = Animated.createAnimatedComponent(RNText);

interface TextProps extends RNTextProps {
	children: React.ReactNode;
	variant?:
		| "title1"
		| "title2"
		| "title3"
		| "headline"
		| "body"
		| "callout"
		| "subheadline"
		| "footnote"
		| "caption1"
		| "caption2";
	weight?: "regular" | "medium" | "semibold" | "bold";
}

export function Text({
	children,
	variant = "body",
	weight = "medium",
	style,
	...props
}: TextProps) {
	return (
		<AnimatedText
			style={[
				tw`text-content-primary`,
				variant === "title1" && tw`title1`,
				variant === "title2" && tw`title2`,
				variant === "title3" && tw`title3`,
				variant === "headline" && tw`headline`,
				variant === "body" && tw`body`,
				variant === "callout" && tw`callout`,
				variant === "subheadline" && tw`subheadline`,
				variant === "footnote" && tw`footnote`,
				variant === "caption1" && tw`caption1`,
				variant === "caption2" && tw`caption2`,
				weight === "regular" && { fontFamily: "OpenRunde" },
				weight === "medium" && { fontFamily: "OpenRundeMedium" },
				weight === "semibold" && { fontFamily: "OpenRundeSemibold" },
				weight === "bold" && { fontFamily: "OpenRundeBold" },
				style,
			]}
			{...props}
		>
			{children}
		</AnimatedText>
	);
}
