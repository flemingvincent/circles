import { createContext } from "react";

import { supabase } from "@/config/supabase";

export type CircleContextProps = {
	createCircle: (circleName: string, userId: string) => Promise<string | undefined>;
};

export const CircleContext = createContext<CircleContextProps>({
	createCircle: async () => "",
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
				.insert({ circle_id: circleData![0].id, profile_id: userId, is_user_an_admin: true, share_location: true });
				
            if (insertCirclesProfilesError) {
                throw insertCirclesProfilesError;
            }

            // create invitation code
            const { data, error: addInvitationCodeError } = await supabase.rpc('add_invitation_code', { circle_id_input: circleData![0].id, created_by_input: userId })
           
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

	return (
		<CircleContext.Provider
			value={{
				createCircle,
			}}
		>
			{children}
		</CircleContext.Provider>
	);
};
