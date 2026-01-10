import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path={"/"} element={<LandingPage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
