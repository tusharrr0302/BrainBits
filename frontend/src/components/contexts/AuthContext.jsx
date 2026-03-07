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

	async function fetchDbUser() {
		try {
			const token = await getAccessTokenSilently();
			const res = await fetch(`/api/users/${user.sub}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setDbUser(res.ok ? await res.json() : null);
		} catch {
			setDbUser(null);
		} finally {
			setDbLoading(false);
		}
	}

	const loading = isLoading || dbLoading;

	return <AuthContext.Provider value={{ user, dbUser, loading, isAuthenticated }}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
