import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { SidebarItems } from "../helpers/SidebarItems.js";

export default function Sidebar({ open, setOpen }) {
	const { user } = useAuth();
	const { logout } = useAuth0();

	const handleLogout = () => {
		logout({ logoutParams: { returnTo: window.location.origin } });
	};

	const initials = user?.name
		?.split(" ")
		.slice(0, 2)
		.map((n) => n.charAt(0).toUpperCase())
		.join("");

	return (
		<aside
			className={`fixed top-0 left-0 h-screen bg-card bg-dark-800 z-100 ${
				open ? "w-64" : "w-20"
			} transition-all duration-300 ease-in-out flex flex-col p-4 z-50`}
		>
			{/* Logo */}
			<div onClick={() => setOpen(!open)} className="flex items-center gap-3 cursor-pointer mb-10 ml-2">
				<img src="/favicons/favicon.svg" alt="🧠" className="w-8 brightness-0 invert" />
				{open && <span className="text-xl font-bold whitespace-nowrap">BrainBits</span>}
			</div>

			{/* User */}
			<div className="flex items-center gap-3 mb-10 ml-1.5">
				{user?.picture ? (
					<img src={user.picture} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
				) : (
					<div className="w-10 h-10 rounded-full text-black bg-neutral-300 bg-accent flex items-center justify-center font-bold">
						{initials}
					</div>
				)}
				{open && (
					<div>
						<p className="font-semibold">{user?.name}</p>
						<p className="text-xs text-textSecondary">{user?.email?.split("@")[0]}</p>
					</div>
				)}
			</div>

			{/* Menu */}
			<nav className="space-y-4 text-sm">
				{Object.values(SidebarItems).map((item) => (
					<MenuItem key={item.name} icon={item.icons && <item.icons />} label={item.name} open={open} link={item.link} />
				))}
				<MenuItem icon={<LogOut />} label="Logout" open={open} onClick={handleLogout} />
			</nav>
		</aside>
	);
}

function MenuItem({ icon, label, open, onClick, link }) {
	return (
		<Link
			to={link}
			onClick={onClick}
			className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-textSecondary hover:bg-cardLight hover:text-white"
		>
			{icon}
			{open && <span>{label}</span>}
		</Link>
	);
}
