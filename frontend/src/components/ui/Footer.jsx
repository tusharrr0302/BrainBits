import { NavItems } from "../helpers/NavItems";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<nav>
			{/* PC Navbar */}
			<header className="hidden bg-black top-0 left-0 w-full h-24 backdrop-blur-xs z-50 md:flex items-center justify-between pl-4 pr-8">
				<div>
					<img src="/logo.png" alt="BrainBits" className="w-36" />
				</div>
				<div>
					<ul className="flex space-x-6">
						{NavItems.map((item) => (
							<li key={item.name} className="w-fit text-white hover:opacity-80 cursor-pointer group">
								<Link to={item.link}>
									<span>{item.name}</span>
									{/* <hr className="border-none bg-white w-0 h-1 group-hover:w-full group-active:w-full transition-[width] duration-300" /> */}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<Link to="/signin" className="">
						<button className="w-21 h-10 bg-cyan-950 border border-cyan-800 rounded flex justify-center items-center cursor-pointer">
							Sign in
						</button>
					</Link>
				</div>
			</header>
		</nav>
	);
};

export default Footer;
