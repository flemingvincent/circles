import { LatLng, Marker } from "react-native-maps";

import { Avatar } from "../ui/Avatar";

import tw from "@/lib/tailwind";
import { IProfile, Status } from "@/types/profile";

export interface ICustomMarkerProps {
	location: IProfile["location"];
	avatar_url: string | null | undefined;
	status?: Status | undefined;
}

export const CustomMarker = ({
	location,
	avatar_url,
	status,
}: ICustomMarkerProps) => {
	return (
		<Marker style={tw``} coordinate={location as LatLng}>
			<Avatar
				avatar_url={avatar_url}
				status={status}
				style={tw`border-2 border-white`}
			/>
		</Marker>
	);
};
