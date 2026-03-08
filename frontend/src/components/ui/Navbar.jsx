import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { NavItems } from "../helpers/NavItems";

const Navbar = () => {
	const { isLoading, isAuthenticated, error, loginWithRedirect: login, logout: auth0Logout, user } = useAuth0();
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);

	const signup = () => login({ authorizationParams: { screen_hint: "signup" } });
	const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

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
					console.error("❌ Failed to save user:", err);
				}
			}
		};
		saveUserToDB();
	}, [isAuthenticated, user]);

	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

				.navbar-root {
					font-family: 'DM Sans', sans-serif;
				}

				.navbar-header {
					background: ${scrolled
						? "rgba(13, 17, 23, 0.92)"
						: "rgba(13, 17, 23, 0.75)"};
					border-bottom: 1px solid ${scrolled ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.04)"};
					backdrop-filter: blur(16px);
					-webkit-backdrop-filter: blur(16px);
					transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
					box-shadow: ${scrolled ? "0 4px 32px rgba(0,0,0,0.45)" : "none"};
				}

				.nav-logo {
					font-family: 'Space Mono', monospace;
					font-size: 1.15rem;
					font-weight: 700;
					letter-spacing: 0.04em;
					color: #fff;
					display: flex;
					align-items: center;
					gap: 8px;
					text-decoration: none;
					position: relative;
				}

				.nav-logo .logo-icon {
					width: 32px;
					height: 32px;
					border-radius: 8px;
					background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 14px;
					font-weight: 700;
					color: #0d1117;
					flex-shrink: 0;
					box-shadow: 0 0 16px rgba(16,185,129,0.35);
				}

				.logo-text-primary {
					color: #fff;
				}

				.logo-text-accent {
					color: #10b981;
				}

				.nav-link {
					font-family: 'Space Mono', monospace;
					font-size: 0.72rem;
					letter-spacing: 0.08em;
					text-transform: uppercase;
					color: #8b949e;
					text-decoration: none;
					position: relative;
					padding: 6px 0;
					transition: color 0.2s ease;
				}

				.nav-link::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 0;
					width: 0;
					height: 1px;
					background: linear-gradient(90deg, #10b981, #06b6d4);
					transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.nav-link:hover,
				.nav-link.active {
					color: #e6edf3;
				}

				.nav-link:hover::after,
				.nav-link.active::after {
					width: 100%;
				}

				.nav-link.active {
					color: #10b981;
				}

				.nav-link.active::after {
					background: #10b981;
					width: 100%;
				}

				/* Active dot indicator */
				.nav-link.active::before {
					content: '';
					position: absolute;
					top: -2px;
					left: 50%;
					transform: translateX(-50%);
					width: 4px;
					height: 4px;
					border-radius: 50%;
					background: #10b981;
					box-shadow: 0 0 6px #10b981;
				}

				.nav-btn {
					font-family: 'Space Mono', monospace;
					font-size: 0.7rem;
					letter-spacing: 0.1em;
					text-transform: uppercase;
					padding: 9px 20px;
					border-radius: 6px;
					cursor: pointer;
					transition: all 0.22s ease;
					position: relative;
					overflow: hidden;
					border: none;
					outline: none;
				}

				.nav-btn-login {
					background: transparent;
					border: 1px solid rgba(16, 185, 129, 0.45);
					color: #10b981;
				}

				.nav-btn-login:hover {
					background: rgba(16, 185, 129, 0.08);
					border-color: rgba(16, 185, 129, 0.8);
					box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.05);
					color: #34d399;
				}

				.nav-btn-logout {
					background: rgba(22, 27, 34, 0.9);
					border: 1px solid rgba(48, 54, 61, 0.8);
					color: #8b949e;
				}

				.nav-btn-logout:hover {
					border-color: rgba(248, 81, 73, 0.5);
					color: #f85149;
					background: rgba(248, 81, 73, 0.06);
				}

				/* User avatar chip */
				.user-chip {
					display: flex;
					align-items: center;
					gap: 10px;
				}

				.user-avatar {
					width: 30px;
					height: 30px;
					border-radius: 50%;
					border: 1.5px solid rgba(16, 185, 129, 0.5);
					object-fit: cover;
					box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
				}

				.user-avatar-fallback {
					width: 30px;
					height: 30px;
					border-radius: 50%;
					background: linear-gradient(135deg, #10b981, #06b6d4);
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 12px;
					font-weight: 700;
					color: #0d1117;
					border: 1.5px solid rgba(16, 185, 129, 0.5);
				}

				/* Corner bracket decoration */
				.corner-bracket {
					position: absolute;
					width: 10px;
					height: 10px;
					opacity: 0.3;
				}
				.corner-bracket.tl {
					top: 8px; left: 8px;
					border-top: 1px solid #10b981;
					border-left: 1px solid #10b981;
				}
				.corner-bracket.br {
					bottom: 8px; right: 8px;
					border-bottom: 1px solid #10b981;
					border-right: 1px solid #10b981;
				}

				/* Scanning line effect */
				@keyframes scan {
					0% { transform: translateY(-100%); opacity: 0; }
					10% { opacity: 1; }
					90% { opacity: 1; }
					100% { transform: translateY(100vh); opacity: 0; }
				}

				/* Mobile nav */
				.mobile-header {
					background: rgba(13, 17, 23, 0.95);
					border-bottom: 1px solid rgba(52, 211, 153, 0.1);
					backdrop-filter: blur(16px);
				}

				.mobile-logo {
					font-family: 'Space Mono', monospace;
					font-weight: 700;
					font-size: 1rem;
					color: #fff;
					letter-spacing: 0.06em;
					display: flex;
					align-items: center;
					gap: 8px;
					text-decoration: none;
				}

				/* Terminal cursor blink on logo */
				@keyframes blink {
					0%, 100% { opacity: 1; }
					50% { opacity: 0; }
				}

				.cursor-blink {
					display: inline-block;
					width: 2px;
					height: 14px;
					background: #10b981;
					margin-left: 2px;
					vertical-align: middle;
					animation: blink 1.1s step-end infinite;
				}
			`}</style>

			<nav className="navbar-root">
				{/* ── PC Navbar ── */}
				<header
					className="navbar-header hidden fixed top-0 left-0 w-full z-50 md:flex items-center justify-between"
					style={{ height: "68px", padding: "0 32px 0 24px" }}
				>
					{/* Decorative corners */}
					<span className="corner-bracket tl" />
					<span className="corner-bracket br" />

					{/* Logo */}
					<Link to="/" className="nav-logo" style={{ minWidth: 160 }}>
						<span className="logo-icon">BB</span>
						<span className="logo-text-primary">Brain</span>
						<span className="logo-text-accent">Bits</span>
						<span className="cursor-blink" />
					</Link>

					{/* Nav links */}
					<ul style={{ display: "flex", gap: "clamp(20px, 3vw, 48px)", listStyle: "none", margin: 0, padding: 0 }}>
						{NavItems.map((item) => {
							const isActive = location.pathname === item.link;
							return (
								<li key={item.name}>
									<Link
										to={item.link}
										className={`nav-link${isActive ? " active" : ""}`}
									>
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>

					{/* Auth area */}
					<div className="user-chip" style={{ minWidth: 160, justifyContent: "flex-end" }}>
						{isAuthenticated && user ? (
							<>
								{user.picture ? (
									<img src={user.picture} alt={user.name} className="user-avatar" />
								) : (
									<span className="user-avatar-fallback">
										{user.name?.[0]?.toUpperCase() ?? "U"}
									</span>
								)}
								<span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#8b949e", letterSpacing: "0.04em", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
									{user.nickname || user.name}
								</span>
								<button className="nav-btn nav-btn-logout" onClick={logout}>
									Logout
								</button>
							</>
						) : (
							<button className="nav-btn nav-btn-login" onClick={signup}>
								Login
							</button>
						)}
					</div>
				</header>

				{/* ── Mobile Navbar ── */}
				<header className="mobile-header md:hidden fixed w-full z-50 flex items-center justify-between px-4" style={{ height: "56px" }}>
					<Link to="/" className="mobile-logo">
						<span className="logo-icon" style={{ width: 26, height: 26, fontSize: 11, borderRadius: 6 }}>BB</span>
						<span style={{ color: "#fff" }}>Brain</span>
						<span style={{ color: "#10b981" }}>Bits</span>
					</Link>
					{isAuthenticated && user && (
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							{user.picture ? (
								<img src={user.picture} alt={user.name} className="user-avatar" />
							) : (
								<span className="user-avatar-fallback" style={{ width: 26, height: 26, fontSize: 10 }}>
									{user.name?.[0]?.toUpperCase() ?? "U"}
								</span>
							)}
						</div>
					)}
				</header>

				{/* Spacer */}
				<div style={{ height: "56px" }} className="md:hidden" />
				<div style={{ height: "68px" }} className="hidden md:block" />
			</nav>
		</>
	);
};

export default Navbar;