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
	getCircles: (	 
		userId: string,
	) => Promise<any>;
	getRelatedProfiles: (		
		userId: string,
	) => Promise<any>;
	getRelatedCircleMappings: (		
		userId: string,
	) => Promise<any>;
	getRelatedProfileMappings: (		
		userId: string,
	) => Promise<any>;
};

export const CircleContext = createContext<CircleContextProps>({
	createCircle: async () => "",
	joinCircle: async () => "",
	getCircles: async () => {},
	getRelatedProfiles: async () => {},
	getRelatedCircleMappings: async () => {},
	getRelatedProfileMappings: async () => {},
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

			if(invitationData![0]){
				const { data: circlesProfilesData, error: insertCirclesProfilesError } = await supabase
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

	const getCircles = async (userId: string) => {
		try {
			// get user cirles
			const { data, error: getCirclesError } = await supabase.rpc(
				"get_circles",
				{ profile_id_input: userId },
			);													  

			if (getCirclesError) {
				throw getCirclesError;
			} else {							
				return Promise.resolve(data);
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve({});
		}
	};

	const getRelatedProfiles = async (userId: string) => {
		try {
			// get user related profiles
			const { data, error: getRelatedProfilesError } = await supabase.rpc(
				"get_related_profiles",
				{ profile_id_input: userId },
			);							  

			if (getRelatedProfilesError) {
				throw getRelatedProfilesError;
			} else {			  
				return Promise.resolve(data);	  
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve({});
		}
	};

	const getRelatedCircleMappings = async (userId: string) => {
		try {
			// get related circle mappings
			const { data, error: getRelatedCircleMappingsError } = await supabase.rpc(
				"get_related_circle_mappings",
				{ profile_id_input: userId },
			);

			if (getRelatedCircleMappingsError) {
				throw getRelatedCircleMappingsError;
			} else {							
				return Promise.resolve(data);
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve({});
		}
	};

	const getRelatedProfileMappings = async (userId: string) => {
		try {
			// get related profile mappings
			const { data, error: getRelatedProfileMappingsError } = await supabase.rpc(
				"get_related_profile_mappings",
				{ profile_id_input: userId },
			);

			if (getRelatedProfileMappingsError) {
				throw getRelatedProfileMappingsError;
			} else {							
				return Promise.resolve(data);
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve({});
		}
	};

	return (
		<CircleContext.Provider
			value={{
				createCircle,
				joinCircle,
				getCircles,
				getRelatedProfiles,
				getRelatedCircleMappings,
				getRelatedProfileMappings,
			}}
		>
			{children}
		</CircleContext.Provider>
	);
};
