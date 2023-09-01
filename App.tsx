import { useDeviceContext } from "twrnc";

import tw from "@/lib/tailwind";
import { AppRoutes } from "@/routes";

export default function App() {
	useDeviceContext(tw);

	return <AppRoutes />;
}
