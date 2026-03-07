import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../helpers/Firebase";
import { useAuth } from "../contexts/AuthContext";
import "./LogIn.css";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		if (user) navigate("/", { replace: true });
		const savedEmail = localStorage.getItem("email");

		if (savedEmail) {
			setEmail(savedEmail);
			setRemember(true);
		}
	}, []);

	async function handleLogin() {
		if (!email || !password) {
			alert("Please fill all fields");
			return;
		}

		if (remember) {
			localStorage.setItem("email", email);
		} else {
			localStorage.removeItem("email");
		}

		try {
			await signInWithEmailAndPassword(auth, email, password);
			// alert("Logged in successfully ✅");
			navigate("/", { replace: true });
		} catch (error) {
			console.error("Error signing in:", error);
			if (error.code === "auth/user-not-found") {
				alert("No account found with this email");
			} else if (error.code === "auth/wrong-password") {
				alert("Incorrect password");
			} else {
				alert("Login failed. Please try again.");
			}
		}
	}

	return (
		<div className="signIn-container">
			<div className="signIn-card">
				{/* LEFT PANEL */}
				<div className="left-panel">
					<img src="/assets/signup-login-bg-img.png" alt="SignIn" className="bg-image" />

					<div className="top-bar">
						<div className="logo">
							<img src="/logo.png" alt="Logo" className="login-logo" />
						</div>
						<div className="back">← Back to website</div>
					</div>

					<div className="hero-text">
						<h1>Build</h1>
						<h1>Learn</h1>
						<h1>Repeat.</h1>
					</div>
				</div>

				{/* RIGHT PANEL */}
				<div className="right-panel">
					<h2>Welcome Back!</h2>
					<p className="login-text">
						Don't have an account? <Link to="/signup">Sign Up</Link>
					</p>

					<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

					<div className="password-box">
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<span className="eye" onClick={() => setShowPassword(!showPassword)}>
							{showPassword ? "🙈" : "👁"}
						</span>
					</div>

					<button className="btn-primary" onClick={handleLogin}>
						Log In
					</button>

					<div className="terms">
						<div className="remember">
							<input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
							<label htmlFor="remember">Remember Me</label>
						</div>

						<a href="#" className="forgot">
							Forgot Your Password?
						</a>
					</div>

					<div className="divider">
						<span></span>
						<p>or login with</p>
						<span></span>
					</div>

					<div className="social-buttons">
						<button className="google">Google</button>
					</div>
				</div>
			</div>
		</div>
	);
}
