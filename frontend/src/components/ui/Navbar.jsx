import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { NavItems } from "../helpers/NavItems";

const Navbar = () => {
	const { isLoading, isAuthenticated, error, loginWithRedirect: login, logout: auth0Logout, user } = useAuth0();

	const signup = () => login({ authorizationParams: { screen_hint: "signup" } });
	const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

	useEffect(() => {
		const saveUserToDB = async () => {
			if (isAuthenticated && user) {
				try {
					const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/createUser`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							auth0Id: user.sub,
							email: user.email,
							name: user.name,
							picture: user.picture,
							nickname: user.nickname,
						}),
					});

					const data = await response.json();
					// console.log("✅ User saved:", data);
				} catch (err) {
					// console.error("❌ Failed to save user:", err);
				}
			}
		};

		saveUserToDB();
	}, [isAuthenticated, user]);

	return (
		<nav>
			{/* PC Navbar */}
			<header className="hidden fixed top-0 left-0 w-full h-24 backdrop-blur-xs z-50 md:flex items-center justify-between pl-4 pr-8">
				<div>
					<img src="/logo.png" alt="BrainBits" className="w-36 lg:w-40 lg:ml-2 xl:w-48 xl:ml-4" />
				</div>
				<div>
					<ul className="flex space-x-6 lg:space-x-8 xl:space-x-12">
						{NavItems.map((item) => (
							<li
								key={item.name}
								className="w-fit text-white hover:opacity-80 cursor-pointer group text-sm lg:text-base xl:text-lg 2xl:text-xl"
							>
								<Link to={item.link}>
									<span>{item.name}</span>
									{/* <hr className="border-none bg-white w-0 h-1 group-hover:w-full group-active:w-full transition-[width] duration-300" /> */}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					{user && isAuthenticated ? (
						<button
							// onClick={handleLogout}
							onClick={logout}
							className="px-6 py-3 bg-cyan-950 border border-cyan-800 rounded-lg cursor-pointer text-sm lg:text-base xl:text-lg 2xl:text-xl z-10"
						>
							Logout
						</button>
					) : (
						<button
							onClick={signup}
							// to="/login"
							className="px-6 py-3 bg-cyan-950 border border-cyan-800 rounded-lg cursor-pointer text-sm lg:text-base xl:text-lg 2xl:text-xl z-10"
						>
							Login
						</button>
					)}
				</div>
			</header>

			{/* Mobile Navbar */}
			<header className="md:hidden fixed w-full h-16 backdrop-blur-xs z-50 flex items-center justify-center px-3">
				<div>
					<img src="/logo.png" alt="BrainBits" className="w-24" />
				</div>
			</header>

			{/* Space */}
			<div className="h-16 md:h-24" />
		</nav>
	);
};

export default Navbar;
