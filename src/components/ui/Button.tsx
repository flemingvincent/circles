import {
	ActivityIndicator,
	TouchableOpacity,
	TouchableOpacityProps,
} from "react-native";

import { Text } from "./Text";

import tw from "@/lib/tailwind";

interface ButtonProps extends TouchableOpacityProps {
	children?: React.ReactNode;
	variant?: "primary" | "secondary" | "outline";
	label?: string;
	loading?: boolean;
}

export function Button({
	children,
	variant = "primary",
	label = "Button",
	loading = false,
	style,
	...props
}: ButtonProps) {
	return (
		<TouchableOpacity
			style={[
				tw`w-full h-12 items-center justify-center rounded-full`,
				variant === "primary" && tw`bg-primary`,
				variant === "secondary" && tw`bg-content-primary`,
				variant === "outline" && tw`bg-white border-[1.5px] border-border`,
				props.disabled && tw`opacity-50`,
				style,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator size="small" />
			) : (
				<Text
					style={[
						variant === "primary" && tw`text-white`,
						variant === "secondary" && tw`text-white`,
						variant === "outline" && tw`text-content-primary`,
					]}
					variant="body"
					weight="semibold"
				>
					{label}
				</Text>
			)}
		</TouchableOpacity>
	);
}
