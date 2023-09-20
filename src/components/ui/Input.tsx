import { forwardRef } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

import { Text } from "./Text";

import tw from "@/lib/tailwind";

interface InputProps extends TextInputProps {
	icon?: React.ReactNode;
	indicator?: React.ReactNode;
	description?: string;
	error?: string;
}

export const Input = forwardRef(
	(props: InputProps, ref: React.Ref<TextInput>) => {
		const { icon, indicator, description, error } = props;
		const rErrorStyle = useAnimatedStyle(() => {
			return {
				opacity: error
					? withTiming(1, {
							duration: 350,
					  })
					: withTiming(0, {
							duration: 350,
					  }),
			};
		});

		return (
			<>
				<View style={tw`flex-row items-center gap-x-4`}>
					<TextInput
						ref={ref}
						style={[
							tw`flex-1 body text-content-primary`,
							{
								fontFamily: "OpenRundeSemibold",
							},
						]}
						autoCorrect={false}
						autoCapitalize="none"
						placeholderTextColor={tw.color("content-tertiary/50")}
						{...props}
					/>
					{icon}
				</View>
				{indicator}
				{description && (
					<Text
						variant="caption1"
						weight="semibold"
						style={[tw`text-content-tertiary mt-6`, !!indicator && tw`mt-4`]}
					>
						{description}
					</Text>
				)}
				{error && (
					<Animated.View
						style={[
							tw`bg-error/5 mt-4 px-4 py-2 rounded-full self-start`,
							rErrorStyle,
						]}
					>
						<Text variant="subheadline" style={tw`text-error`}>
							{error}
						</Text>
					</Animated.View>
				)}
			</>
		);
	},
);
