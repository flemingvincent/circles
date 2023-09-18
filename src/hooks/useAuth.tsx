import { useContext } from "react";

import { FirebaseContext } from "@/providers/AuthProvider";

export const useAuth = () => useContext(FirebaseContext);
