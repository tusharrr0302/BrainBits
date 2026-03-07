import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/contexts/AuthContext";
import LandingPage from "./components/pages/LandingPage";
import Signup from "./components/pages/Signup";
import Login from "./components/pages/Login";
import ProtectedRoute from "./components/utils/ProtectedRoutes";
import Dashboard from "./components/pages/Dashboard";
import CodeEditor from "./components/pages/CodeEditor";
import ScheduleGenerator from "./components/pages/ScheduleGenerator";
import AIChatBot from "./components/pages/AIChatBot";

const App = () => {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path={"/"} element={<LandingPage />} />
					<Route path={"/signup"} element={<Signup />} />
					<Route path={"/login"} element={<Login />} />
					<Route
						path={"/dashboard"}
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path={"/study-planner"}
						element={
							<ProtectedRoute>
								<ScheduleGenerator />
							</ProtectedRoute>
						}
					/>
					<Route
						path={"/coding-lab"}
						element={
							<ProtectedRoute>
								<CodeEditor />
							</ProtectedRoute>
						}
					/>
					<Route
						path={"/chatbot"}
						element={
							<ProtectedRoute>
								<AIChatBot />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
};

export default App;
