import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/contexts/AuthContext";
import LandingPage from "./components/pages/LandingPage";
import ProtectedRoute from "./components/utils/ProtectedRoutes";
import Dashboard from "./components/pages/Dashboard";
import CodeEditor from "./components/pages/CodeEditor";
import ScheduleGenerator from "./components/pages/ScheduleGenerator";
import AIChatBot from "./components/pages/AIChatBot";
import Codebattle from "./components/pages/Codebattle";

const App = () => {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path={"/"} element={<LandingPage />} />
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
						path={"/chatbot"}
						element={
							<ProtectedRoute>
								<AIChatBot />
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
						path={"/code-battle"}
						element={
							<ProtectedRoute>
								<Codebattle />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
};

export default App;
