import { Link } from "react-router-dom";
import Footer from "../ui/Footer";
import LandingHighlight from "../ui/LandingHighlight";
import Navbar from "../ui/Navbar";

const LandingPage = () => {
	return (
		<div className="flex flex-col">
			<div className="flex-1 relative">
				<Navbar />
				<div className="flex md:hidden flex-col justify-center items-center space-y-4 p-20 text-center">
					<span>Aspect ratio not supported.</span>
					<span>Please use a tablet or a computer !!</span>
				</div>
				<div className="hidden md:flex flex-col justify-center items-center w-full min-h-[calc(100dvh-6rem)] px-8">
					<div className="w-full flex flex-col gap-4">
						<div className="flex flex-col w-full text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-medium space-y-6 text-center xl:text-justify leading-none xl:leading-tight mb-8">
							<h1>
								How <LandingHighlight>students</LandingHighlight> track,
							</h1>
							<h1>
								practice & <LandingHighlight>improve</LandingHighlight>
							</h1>
							<h1>with AI</h1>
						</div>
						<div className="flex flex-col justify-center w-full h-1/3 text-sm lg:text-base xl:text-lg 2xl:text-2xl space-y-2 text-center xl:text-justify">
							<span>It uniquely combines AI tools, IDE functionalities, and Analytics to enhance the learning experience.</span>
							<span>
								It also provides a free access model, democratizes learning for all students
								<span className="not-xl:hidden">, promoting equal opportunities</span>.
							</span>
						</div>
						<div className="w-full flex justify-start m-4">
							<Link to="/">
								<button className="px-6 py-3 bg-cyan-950 border border-cyan-800 rounded-lg cursor-pointer text-sm lg:text-base xl:text-lg 2xl:text-xl">
									Try Now
								</button>
							</Link>
						</div>
					</div>
				</div>
				<div className="-z-1 fixed -bottom-4/7 xl:-right-1/2">
					<img src="/assets/globe.png" alt="" className="w-960 lg:w-400 opacity-5" />
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default LandingPage;
