import { useContext } from "react";

import { CircleContext } from "@/providers/CircleProvider";

export const useCircle = () => useContext(CircleContext);