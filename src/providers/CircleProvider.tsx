import { createContext } from "react";

import { supabase } from "@/config/supabase";

export type CircleContextProps = {
	createCircle: (
		circleName: string,
		userId: string,
	) => Promise<string | undefined>;
	joinCircle: (
		inviteCode: string,
		userId: string,
	) => Promise<string | undefined>;
};

export const CircleContext = createContext<CircleContextProps>({
	createCircle: async () => "",
	joinCircle: async () => "",
});

export const CircleProvider = ({ children }: any) => {
	const createCircle = async (circleName: string, userId: string) => {
		try {
			const { data: circleData, error: createCircleError } = await supabase
				.from("circles")
				.insert({ name: circleName })
				.select();

			if (createCircleError) {
				throw createCircleError;
			}

			const { error: insertCirclesProfilesError } = await supabase
				.from("circles_profiles")
				.insert({
					circle_id: circleData![0].id,
					profile_id: userId,
					is_user_an_admin: true,
					share_location: true,
				});

			if (insertCirclesProfilesError) {
				throw insertCirclesProfilesError;
			}

			// create invitation code
			const { data, error: addInvitationCodeError } = await supabase.rpc(
				"add_invitation_code",
				{ circle_id_input: circleData![0].id, created_by_input: userId },
			);

			if (addInvitationCodeError) {
				throw addInvitationCodeError;
			} else {
				return Promise.resolve(data);
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve("");
		}
	};

	const joinCircle = async (inviteCode: string, userId: string) => {
		try {
			const { data: invitationData, error: joinCircleError } = await supabase
				.from("invitations")
				.select("*")
				.ilike("invitation_code", inviteCode)
				.gt("expiration_date", new Date().toDateString());

			if (joinCircleError) {
				throw joinCircleError;
			}

			if (invitationData![0]) {
				const { data: circlesProfilesData, error: insertCirclesProfilesError } =
					await supabase
						.from("circles_profiles")
						.insert({
							circle_id: invitationData![0].circle_id,
							profile_id: userId,
							is_user_an_admin: false,
							share_location: true,
						})
						.select();

				if (insertCirclesProfilesError) {
					throw insertCirclesProfilesError;
				} else {
					// just return row id for now
					return Promise.resolve(circlesProfilesData![0].id);
				}
			} else {
				return Promise.resolve("Invalid Invitation Code");
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve("");
		}
	};

	return (
		<CircleContext.Provider
			value={{
				createCircle,
				joinCircle,
			}}
		>
			{children}
		</CircleContext.Provider>
	);
};
