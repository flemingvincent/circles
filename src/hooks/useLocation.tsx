import { useContext } from "react";

import { LocationContext } from "@/providers/LocationProvider";

export const useLocation = () => useContext(LocationContext);
