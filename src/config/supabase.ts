import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
	getItem: (key: string) => {
		return SecureStore.getItemAsync(key);
	},
	setItem: (key: string, value: string) => {
		SecureStore.setItemAsync(key, value);
	},
	removeItem: (key: string) => {
		SecureStore.deleteItemAsync(key);
	},
};

const supabaseUrl = "https://lbqsnfbufumsccdijmee.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicXNuZmJ1ZnVtc2NjZGlqbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUzODY0NDQsImV4cCI6MjAxMDk2MjQ0NH0.2i-7zbh568DsnD9_hLIMzmA4kBMNvcQSB3I5v5b8uW4";

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		storage: ExpoSecureStoreAdapter as any,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
