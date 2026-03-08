import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const { user, isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
	const [dbUser, setDbUser] = useState(null);
	const [dbLoading, setDbLoading] = useState(true);

	useEffect(() => {
		if (isLoading) return;

		if (isAuthenticated && user) {
			fetchDbUser();
		} else {
			setDbUser(null);
			setDbLoading(false);
		}
	}, [isLoading, isAuthenticated, user]);

	const fetchDbUser = async () => {
		try {
			const token = await getAccessTokenSilently();
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user?email=${encodeURIComponent(user?.email)}`, {
				// method: "GET",
				// headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			});
			const data = await res.json();
			setDbUser(data?.user);
			// setDbUser(res.ok ? await res.json() : null);
		} catch {
			setDbUser(null);
		} finally {
			setDbLoading(false);
		}
	};

	const loading = isLoading || dbLoading;

	return (
		<>
			<AuthContext.Provider value={{ user, dbUser, loading, isAuthenticated }}>{!loading && children}</AuthContext.Provider>;
		</>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
