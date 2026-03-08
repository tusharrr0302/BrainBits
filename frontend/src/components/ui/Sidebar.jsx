import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
	{ label: "Dashboard",     link: "/dashboard"     },
	{ label: "Study Planner", link: "/study-planner" },
	{ label: "Coding Lab",    link: "/coding-lab"    },
	{ label: "Chatbot",       link: "/chatbot"       },
	{ label: "Code Battle",   link: "/codebattle"   }
];

const Sidebar = () => {
	const { isAuthenticated, user, loginWithRedirect: login, logout: auth0Logout } = useAuth0();
	const location = useLocation();
	const [mobileOpen, setMobileOpen] = useState(false);

	const signup = () => login({ authorizationParams: { screen_hint: "signup" } });
	const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

	useEffect(() => {
		const saveUserToDB = async () => {
			if (isAuthenticated && user) {
				try {
					await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/createUser`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							auth0Id: user.sub, email: user.email,
							name: user.name, picture: user.picture, nickname: user.nickname,
						}),
					});
				} catch (_) {}
			}
		};
		saveUserToDB();
	}, [isAuthenticated, user]);

	useEffect(() => { setMobileOpen(false); }, [location.pathname]);

	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

				* { box-sizing: border-box; margin: 0; padding: 0; }

				.sb-root { font-family: 'DM Sans', sans-serif; }

				/* ── Glass panel ── */
				.sb-panel {
					position: fixed;
					top: 12px;
					left: 12px;
					height: calc(100vh - 24px);
					width: 210px;
					border-radius: 18px;

					/* Glass effect */
					background: rgba(11, 17, 24, 0.72);
					backdrop-filter: blur(24px) saturate(160%);
					-webkit-backdrop-filter: blur(24px) saturate(160%);

					/* Glassy border */
					border: 1px solid #1e2d3d;
					box-shadow: 0 8px 48px rgba(0, 0, 0, 0.55);

					display: flex;
					flex-direction: column;
					z-index: 100;
					overflow: hidden;
				}

				/* Top highlight shimmer line */
				.sb-panel::before {
					content: '';
					position: absolute;
					top: 0; left: 10%; right: 10%;
					height: 1px;
					background: linear-gradient(90deg, transparent, rgba(160,170,255,0.25), transparent);
					pointer-events: none;
					z-index: 2;
				}



				/* ── Brand ── */
				.sb-brand {
					padding: 26px 20px 22px;
					flex-shrink: 0;
					text-decoration: none;
					display: block;
					position: relative;
					z-index: 1;
				}

				.sb-brand-text {
					font-family: 'Space Mono', monospace;
					font-size: 0.98rem;
					font-weight: 700;
					letter-spacing: 0.06em;
					color: #6366f1;
				}

				/* Thin separator line */
				.sb-sep {
					height: 1px;
					margin: 0 16px;
					background: #1e2d3d;
					flex-shrink: 0;
					position: relative;
					z-index: 1;
				}

				/* ── Nav ── */
				.sb-nav {
					flex: 1;
					display: flex;
					flex-direction: column;
					padding: 16px 0 8px;
					overflow-y: auto;
					overflow-x: hidden;
					position: relative;
					z-index: 1;
				}

				.sb-nav::-webkit-scrollbar { width: 0; }

				/* Section label */
				.sb-nav-section {
					font-family: 'Space Mono', monospace;
					font-size: 0.55rem;
					letter-spacing: 0.14em;
					text-transform: uppercase;
					color: #2a3d52;
					padding: 0 20px 8px;
				}

				.sb-nav-item {
					display: flex;
					align-items: center;
					padding: 9px 20px;
					margin: 1px 8px;
					border-radius: 10px;
					text-decoration: none;
					font-size: 0.82rem;
					font-weight: 400;
					letter-spacing: 0.01em;
					white-space: nowrap;
					overflow: hidden;
					position: relative;
					transition: all 0.18s ease;
					cursor: pointer;
					border: none;
					background: transparent;
					width: calc(100% - 16px);
					text-align: left;
					color: #2a3d52;
				}

				.sb-nav-item:hover {
					color: #81a8f8;
					background: rgba(30, 45, 61, 0.3);
				}

				.sb-nav-item.active {
					color: #81a8f8;
					font-weight: 500;
				}

				/* ── Logout ── */
				.sb-nav-item.logout-item {
					color: #2a3d52;
					font-size: 0.78rem;
				}
				.sb-nav-item.logout-item:hover {
					color: #f87171;
					background: rgba(248,113,113,0.05);
				}

				/* ── Bottom: profile + logout ── */
				.sb-bottom {
					flex-shrink: 0;
					position: relative;
					z-index: 1;
					padding: 0 0 16px;
				}

				.sb-bottom-sep {
					height: 1px;
					margin: 0 16px 12px;
					background: #1e2d3d;
				}

				/* Glass user card */
				.sb-user-card {
					margin: 0 10px;
					padding: 11px 12px;
					border-radius: 12px;
					background: rgba(30, 45, 61, 0.3);
					border: 1px solid #1e2d3d;
					display: flex;
					align-items: center;
					gap: 10px;
					overflow: hidden;
				}

				.sb-avatar {
					width: 32px;
					height: 32px;
					min-width: 32px;
					border-radius: 50%;
					border: 1.5px solid rgba(99,102,241,0.4);
					object-fit: cover;
				}

				.sb-avatar-fallback {
					width: 32px;
					height: 32px;
					min-width: 32px;
					border-radius: 50%;
					background: linear-gradient(135deg, #6366f1, #38bdf8);
					display: flex;
					align-items: center;
					justify-content: center;
					font-family: 'Space Mono', monospace;
					font-size: 12px;
					font-weight: 700;
					color: #fff;
					flex-shrink: 0;
				}

				.sb-user-name {
					font-size: 0.78rem;
					font-weight: 500;
					color: #a5bee0;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: 1.3;
				}

				.sb-user-handle {
					font-family: 'Space Mono', monospace;
					font-size: 0.55rem;
					color: #2a3d52;
					letter-spacing: 0.03em;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					margin-top: 1px;
				}

				/* ── Mobile hamburger ── */
				.sb-mobile-trigger {
					display: none;
					position: fixed;
					top: 16px; left: 16px;
					z-index: 200;
					width: 38px; height: 38px;
					border-radius: 10px;
					background: rgba(15,18,32,0.8);
					backdrop-filter: blur(12px);
					border: 1px solid rgba(99,102,241,0.2);
					align-items: center;
					justify-content: center;
					cursor: pointer;
					color: #4a5680;
					transition: all 0.2s ease;
				}

				.sb-mobile-trigger:hover {
					border-color: rgba(99,102,241,0.5);
					color: #818cf8;
				}

				.sb-overlay {
					display: none;
					position: fixed;
					inset: 0;
					background: rgba(0,0,0,0.6);
					z-index: 98;
					backdrop-filter: blur(4px);
				}

				.sb-page-offset { margin-left: 234px; }

				@media (max-width: 768px) {
					.sb-panel {
						top: 0; left: 0;
						height: 100vh;
						border-radius: 0 18px 18px 0;
						transform: translateX(${mobileOpen ? "0" : "-100%"});
						transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
					}
					.sb-mobile-trigger { display: flex; }
					.sb-overlay { display: ${mobileOpen ? "block" : "none"}; }
					.sb-page-offset { margin-left: 0 !important; }
				}
			`}</style>

			<div className="sb-root">
				<div className="sb-overlay" onClick={() => setMobileOpen(false)} />

				<button className="sb-mobile-trigger" onClick={() => setMobileOpen(o => !o)}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						{mobileOpen
							? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
							: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
						}
					</svg>
				</button>

				<aside className="sb-panel">

					{/* Brand */}
					<Link to="/" className="sb-brand">
						<span className="sb-brand-text">BrainBits</span>
					</Link>

					<div className="sb-sep" />

					{/* Nav */}
					<nav className="sb-nav">
						<div className="sb-nav-section">Menu</div>
						{NAV_ITEMS.map(({ label, link }) => {
							const active = location.pathname === link;
							return (
								<Link
									key={label}
									to={link}
									className={`sb-nav-item${active ? " active" : ""}`}
								>
									{label}
								</Link>
							);
						})}
					</nav>

					{/* Bottom: profile + logout */}
					<div className="sb-bottom">
						{/* Logout */}
						{isAuthenticated ? (
							<button className="sb-nav-item logout-item" style={{ width: "calc(100% - 16px)", margin: "0 8px 10px" }} onClick={logout}>
								Logout
							</button>
						) : (
							<button className="sb-nav-item active" style={{ width: "calc(100% - 16px)", margin: "0 8px 10px" }} onClick={signup}>
								Login
							</button>
						)}

						<div className="sb-bottom-sep" />

						{/* User card */}
						{isAuthenticated && user && (
							<div className="sb-user-card">
								{user.picture
									? <img src={user.picture} alt={user.name} className="sb-avatar" />
									: <span className="sb-avatar-fallback">{user.name?.[0]?.toUpperCase() ?? "U"}</span>
								}
								<div style={{ overflow: "hidden" }}>
									<div className="sb-user-name">{user.name}</div>
									<div className="sb-user-handle">{user.nickname || user.email}</div>
								</div>
							</div>
						)}
					</div>

				</aside>
			</div>
		</>
	);
};

export default Sidebar;