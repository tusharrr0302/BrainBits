import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../helpers/Firebase";
import { useAuth } from "../contexts/AuthContext";

import "./Signup.css";

export default function Signup() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({});

	const navigate = useNavigate();
	const { user } = useAuth();
	const googleProvider = new GoogleAuthProvider();

	useEffect(() => {
		if (user) {
			navigate("/", { replace: true });
		}
		googleProvider.setCustomParameters({
			prompt: "select_account",
		});
	}, [user]);

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

	const isFormFilled = firstName.trim() && lastName.trim() && email.trim() && password.trim();

	function validate() {
		let newErrors = {};

		// First Name
		if (!/^[A-Za-z]+$/.test(firstName)) {
			newErrors.firstName = "First name should contain only letters";
		}

		// Last Name
		if (!/^[A-Za-z]+$/.test(lastName)) {
			newErrors.lastName = "Last name should contain only letters";
		}

		// Email
		if (!email.includes("@") || !email.includes(".")) {
			newErrors.email = "Email must be valid";
		}

		// Password
		if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/[A-Z]/.test(password)) {
			newErrors.password = "Password must contain one uppercase letter";
		} else if (!/[a-z]/.test(password)) {
			newErrors.password = "Password must contain one lowercase letter";
		} else if (!/[0-9]/.test(password)) {
			newErrors.password = "Password must contain one number";
		} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			newErrors.password = "Password must contain one special character";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit() {
		if (!validate()) return;
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			await updateProfile(userCredential.user, {
				displayName: `${firstName} ${lastName}`,
			});
			await setDoc(doc(db, "users", userCredential.user.uid), {
				firstName,
				lastName,
				email,
				github: "",
				leetcode: "",
				pfp: "",
				createdAt: serverTimestamp(),
			});
			// alert("Signup Successful :)");
			navigate("/dashboard", { replace: true });
		} catch (error) {
			console.error(error);
			alert("We encountered an error during signup. Please try again.");
		}
	}

	return (
		<div className="signup-container">
			<div className="signup-card">
				{/* LEFT PANEL */}
				<div className="left-panel">
					<img src="/assets/signup-login-bg-img.png" alt="Signup" className="bg-image" />

					<div className="top-bar">
						<div className="logo">
							<img src="/logo.png" alt="Logo" className="signup-logo" />
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
					<h2 className="font-bold">Create an account</h2>
					<p className="login-text">
						Already have an account? <Link to="/login">Login</Link>
					</p>

					<form action="" onSubmit={(e) => e.preventDefault()}>
						<div className="name-row">
							<div className="fName field">
								<input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
								{errors.firstName && <small className="error">{errors.firstName}</small>}
							</div>

							<div className="lName field">
								<input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
								{errors.lastName && <small className="error">{errors.lastName}</small>}
							</div>
						</div>

						<div className="field">
							<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
							{errors.email && <small className="error">{errors.email}</small>}
						</div>

						<div className="field password-box">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<span className="eye" onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? "🙈" : "👁"}
							</span>
							{errors.password && <small className="error">{errors.password}</small>}
						</div>

						<button className="btn-primary hover:opacity-80 transition-opacity" onClick={handleSubmit} disabled={!isFormFilled}>
							Create Account
						</button>

						<div className="divider">
							<span></span>
							<p>or register with</p>
							<span></span>
						</div>

						{/* <div className="social-buttons">
							<button className="google">Google</button>
						</div> */}

						<div className="social-buttons">
							<button
								className="google hover:opacity-80 transition-opacity flex justify-center items-center gap-4"
								onClick={handleGoogleLogin}
							>
								<img
									src="https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/google/google-original.svg"
									alt=""
									className="w-6"
								/>
								<span>Google</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
