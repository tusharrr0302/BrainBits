import { signOut } from "firebase/auth";
import { auth } from "../helpers/Firebase";
import { useAuth } from "../contexts/AuthContext";

const SomePage = () => {
	const { user } = useAuth();

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<>
			<div>{user.displayName}</div>
			<button onClick={handleLogout}>Logout</button>
		</>
	);
};

export default SomePage;
