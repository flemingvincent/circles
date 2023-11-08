import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

import { Alert, Button, Input, Text } from "@/components/ui";
import tw from "@/lib/tailwind";
import { ProtectedStackParamList } from "@/routes/protected";

type JoinProps = NativeStackScreenProps<ProtectedStackParamList, "Join">;

export default function Join({ navigation }: JoinProps) {
	const alertRef = useRef<any>(null);

	const formSchema = z.object({
		code: z
			.string({
				required_error: "Oops! A code is required.",
			})
			.regex(/^[0-9]+$/, "Oops! Only numbers allowed.")
			.min(6, "Oops! 6 digits are required."),
	});

	const {
		control,
		handleSubmit,
		// trigger,
		// getValues,
		formState: { errors, isSubmitting },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			const { code } = data;
			console.log(code);
		} catch (error) {
			console.log(error);
			alertRef.current?.showAlert({
				title: "Oops!",
				// @ts-ignore
				message: error.message + ".",
				variant: "error",
			});
		}
	};

	return (
		<SafeAreaView style={tw`flex-1 bg-white`}>
			<Alert ref={alertRef} />
			<KeyboardAvoidingView
				style={tw`flex-1`}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<Pressable
					style={tw`pt-4 pb-6 px-4`}
					hitSlop={24}
					onPress={() => {
						navigation.goBack();
					}}
				>
					<Image
						source={require("@/assets/icons/arrow-left.svg")}
						style={tw`w-6 h-6`}
					/>
				</Pressable>
				<View style={tw`flex-1 px-12`}>
					<Text variant="title1" weight="semibold" style={tw`mb-4`}>
						Join Circle
					</Text>
					<Text
						variant="callout"
						weight="semibold"
						style={tw`text-content-secondary mb-6`}
					>
						If you&apos;ve been invited to a circle, enter the invite code below
						to join.
					</Text>
					<Controller
						control={control}
						name="code"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Invite Code"
								error={errors.code?.message}
								value={value}
								onChangeText={onChange}
								maxLength={6}
								keyboardType="number-pad"
							/>
						)}
					/>
				</View>
				<View style={tw`px-12`}>
					<Button
						variant="primary"
						label="Continue"
						style={tw`mb-4`}
						loading={isSubmitting}
						onPress={handleSubmit(onSubmit)}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
