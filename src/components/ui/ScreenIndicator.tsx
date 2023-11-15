import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

import tw from "@/lib/tailwind";

interface IScreenIndicatorProps {
	activeIndex: Animated.SharedValue<number>;
	index: number;
}

export const ScreenIndicator = ({
	activeIndex,
	index,
}: IScreenIndicatorProps) => {
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
