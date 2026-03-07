import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../helpers/Firebase";
import { useAuth } from "../contexts/AuthContext";

import "./Login.css";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const { user } = useAuth();
	const googleProvider = new GoogleAuthProvider();

	useEffect(() => {
		if (user) navigate("/", { replace: true });
		const savedEmail = localStorage.getItem("email");

		if (savedEmail) {
			setEmail(savedEmail);
			setRemember(true);
		}

		googleProvider.setCustomParameters({
			prompt: "select_account",
		});
	}, []);

	async function handleGoogleLogin() {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const user = result.user;
			const userRef = doc(db, "users", user.uid);
			const snap = await getDoc(userRef);
			if (!snap.exists()) {
				const [firstName = "", lastName = ""] = (user.displayName || "").split(" ");
				await setDoc(userRef, {
					firstName,
					lastName,
					email: user.email,
					github: "",
					leetcode: "",
					pfp: user.photoURL || "",
					provider: "google",
					createdAt: serverTimestamp(),
				});
			}
			// alert("Logged in with Google ✅");
			navigate("/", { replace: true });
		} catch (error) {
			console.error("Google login error:", error);
			// alert("Google sign-in failed");
		}
	}

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
			navigate("/dashboard", { replace: true });
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
						<Link to="/" className="back">
							← Back to website
						</Link>
					</div>

					<div className="hero-text">
						<h1>Build</h1>
						<h1>Learn</h1>
						<h1>Repeat.</h1>
					</div>
				</div>

				{/* RIGHT PANEL */}
				<div className="right-panel">
					<h2 className="font-bold">Welcome Back !!</h2>
					<p className="login-text">
						Don't have an account? <Link to="/signup">Sign Up</Link>
					</p>

					<div className="field">
						<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
					</div>

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
						{/* <button className="google">Google</button> */}

						<button
							className="google hover:opacity-80 transition-opacity flex justify-center items-center gap-4"
							onClick={handleGoogleLogin}
						>
							<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/google/google-original.svg" alt="" className="w-6" />
							<span>Google</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
