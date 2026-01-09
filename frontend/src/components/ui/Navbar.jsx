import { NavItems } from "../helpers/NavItems";
import { Link } from "react-router-dom";

const Navbar = () => {
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
					<Link to="/">
						<button className="px-6 py-3 bg-cyan-950 border border-cyan-800 rounded-lg cursor-pointer text-sm lg:text-base xl:text-lg 2xl:text-xl z-10">
							Sign In
						</button>
					</Link>
					{/* <Link to="/signin" className="">
						<button className="w-21 h-10 bg-cyan-950 border border-cyan-800 rounded flex justify-center items-center cursor-pointer text-sm lg:text-base xl:text-lg 2xl:text-xl">
							Sign in
						</button>
					</Link> */}
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
