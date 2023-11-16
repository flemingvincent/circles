export type Status = "active" | "busy" | "away" | "offline";

export type Location = {
	longitude: number;
	latitude: number;
} | null;

export interface IProfile {
	id: string;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	avatar_url?: string | null;
	location?: Location;
	status?: Status | null;
}
