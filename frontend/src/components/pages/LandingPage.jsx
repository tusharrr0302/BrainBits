import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../ui/Navbar";
import { useAuth } from "../contexts/AuthContext";
import Spacebackground from "../ui/Spacebackground.jsx";
import "./LandingPage.css";

// ── Full desk scene SVG ──────────────────────────────────────────────────────
const DeskScene = () => (
	<div className="monitor-wrap">
		<svg className="monitor-svg" viewBox="0 0 420 580" fill="none" xmlns="http://www.w3.org/2000/svg">
			{/* ═══════════════════════════════════════════
			    TOP AREA — floating code snippet card
			    ═══════════════════════════════════════════ */}
			<rect x="20" y="8" width="180" height="72" rx="8" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* card header */}
			<rect x="20" y="8" width="180" height="16" rx="8" fill="#111d2a" />
			<rect x="20" y="16" width="180" height="8" fill="#111d2a" />
			<circle cx="31" cy="16" r="3" fill="#3d1f1f" />
			<circle cx="40" cy="16" r="3" fill="#3d3010" />
			<circle cx="49" cy="16" r="3" fill="#1a3a1a" />
			<text x="58" y="19" fontSize="4.5" fill="#2a3d52" fontFamily="monospace">
				Dashboard.jsx
			</text>
			{/* code lines */}
			<rect x="28" y="30" width="18" height="4" rx="1" fill="#20a0c0" />
			<rect x="50" y="30" width="28" height="4" rx="1" fill="#ffa116" />
			<rect x="82" y="30" width="12" height="4" rx="1" fill="#4a6a8a" />
			<rect x="28" y="40" width="14" height="4" rx="1" fill="#20a0c0" />
			<rect x="46" y="40" width="36" height="4" rx="1" fill="#c8d6e5" opacity="0.5" />
			<rect x="86" y="40" width="8" height="4" rx="1" fill="#4a6a8a" />
			<rect x="98" y="40" width="22" height="4" rx="1" fill="#5cde5c" />
			<rect x="28" y="50" width="22" height="4" rx="1" fill="#20a0c0" />
			<rect x="54" y="50" width="16" height="4" rx="1" fill="#c8d6e5" opacity="0.4" />
			<rect x="74" y="50" width="40" height="4" rx="1" fill="#ffa116" />
			<rect x="28" y="60" width="60" height="4" rx="1" fill="#c8d6e5" opacity="0.2" />
			<rect x="92" y="60" width="40" height="4" rx="1" fill="#c8d6e5" opacity="0.15" />
			{/* blink cursor */}
			<rect x="28" y="68" width="5" height="8" rx="1" fill="#20a0c0">
				<animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
			</rect>

			{/* top-right floating stats badge */}
			<rect x="230" y="12" width="168" height="60" rx="8" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			<text x="242" y="28" fontSize="5" fill="#2a3d52" fontFamily="monospace" letterSpacing="1">
				TODAY'S ACTIVITY
			</text>
			<rect x="240" y="32" width="148" height="1" fill="#1e2d3d" />
			{/* stat cols */}
			<text x="242" y="46" fontSize="12" fontWeight="700" fill="#5cde5c" fontFamily="monospace">
				214
			</text>
			<text x="242" y="54" fontSize="4" fill="#2a3d52" fontFamily="monospace" letterSpacing="0.8">
				GH COMMITS
			</text>
			<rect x="282" y="36" width="1" height="28" fill="#1e2d3d" />
			<text x="290" y="46" fontSize="12" fontWeight="700" fill="#20a0c0" fontFamily="monospace">
				67
			</text>
			<text x="290" y="54" fontSize="4" fill="#2a3d52" fontFamily="monospace" letterSpacing="0.8">
				LC SOLVED
			</text>
			<rect x="330" y="36" width="1" height="28" fill="#1e2d3d" />
			<text x="338" y="46" fontSize="12" fontWeight="700" fill="#c8d6e5" fontFamily="monospace">
				61
			</text>
			<text x="338" y="54" fontSize="4" fill="#2a3d52" fontFamily="monospace" letterSpacing="0.8">
				DAY STREAK
			</text>

			{/* ═══════════════════════════════════════════
			    MONITOR
			    ═══════════════════════════════════════════ */}
			<rect x="30" y="94" width="360" height="232" rx="10" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1.2" />
			<rect x="40" y="104" width="340" height="212" rx="6" fill="#0b1118" />

			{/* title bar */}
			<rect x="40" y="104" width="340" height="20" rx="6" fill="#0d1a28" />
			<rect x="40" y="116" width="340" height="8" fill="#0d1a28" />
			<circle cx="54" cy="114" r="4" fill="#3d1f1f" />
			<circle cx="66" cy="114" r="4" fill="#3d3010" />
			<circle cx="78" cy="114" r="4" fill="#1a3a1a" />
			<rect x="92" y="107" width="84" height="14" rx="3" fill="#111d2a" stroke="#1e2d3d" strokeWidth="0.8" />
			<rect x="96" y="111" width="50" height="5" rx="1.5" fill="#2a3d52" />
			<rect x="182" y="109" width="60" height="10" rx="3" fill="none" />
			<rect x="185" y="111" width="36" height="5" rx="1.5" fill="#1e2d3d" opacity="0.5" />

			{/* line number gutter */}
			<rect x="40" y="124" width="16" height="192" fill="#0d1a28" />
			{[138, 152, 166, 180, 194, 208, 222, 236, 250, 264, 278, 292, 306].map((y, i) => (
				<text key={i} x="43" y={y} fontSize="4.5" fill="#1e2d3d" fontFamily="monospace" dominantBaseline="middle">
					{i + 1}
				</text>
			))}

			{/* code rows */}
			{/* row 1 */}
			<rect x="62" y="134" width="22" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="88" y="134" width="14" height="5" rx="1.5" fill="#c8d6e5" opacity="0.55" />
			<rect x="106" y="134" width="28" height="5" rx="1.5" fill="#ffa116" />
			<rect x="138" y="134" width="10" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="152" y="134" width="20" height="5" rx="1.5" fill="#5cde5c" />
			{/* row 2 */}
			<rect x="62" y="148" width="22" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="88" y="148" width="8" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="100" y="148" width="30" height="5" rx="1.5" fill="#c8d6e5" opacity="0.6" />
			<rect x="134" y="148" width="8" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="146" y="148" width="20" height="5" rx="1.5" fill="#ffa116" />
			{/* row 3 blank */}
			{/* row 4 */}
			<rect x="62" y="166" width="32" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="98" y="166" width="24" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="126" y="166" width="32" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="162" y="166" width="40" height="5" rx="1.5" fill="#ffa116" />
			<rect x="206" y="166" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			{/* row 5 */}
			<rect x="72" y="180" width="18" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="94" y="180" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="104" y="180" width="26" height="5" rx="1.5" fill="#c8d6e5" opacity="0.5" />
			<rect x="134" y="180" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="144" y="180" width="38" height="5" rx="1.5" fill="#c8d6e5" opacity="0.5" />
			<rect x="186" y="180" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="196" y="180" width="22" height="5" rx="1.5" fill="#ffa116" />
			{/* row 6 */}
			<rect x="72" y="194" width="44" height="5" rx="1.5" fill="#ffa116" />
			<rect x="120" y="194" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="130" y="194" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			{/* row 7 */}
			<rect x="82" y="208" width="32" height="5" rx="1.5" fill="#c8d6e5" opacity="0.5" />
			<rect x="118" y="208" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="128" y="208" width="22" height="5" rx="1.5" fill="#c8d6e5" opacity="0.5" />
			<rect x="154" y="208" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="164" y="208" width="8" height="5" rx="1.5" fill="#c8d6e5" opacity="0.35" />
			{/* row 8 */}
			<rect x="72" y="222" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			{/* row 9 */}
			<rect x="62" y="236" width="28" height="5" rx="1.5" fill="#20a0c0" />
			<rect x="94" y="236" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			{/* row 10 */}
			<rect x="72" y="250" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			<rect x="82" y="250" width="16" height="5" rx="1.5" fill="#5cde5c" />
			<rect x="102" y="250" width="42" height="5" rx="1.5" fill="#c8d6e5" opacity="0.35" />
			<rect x="148" y="250" width="50" height="5" rx="1.5" fill="#ffa116" />
			<rect x="202" y="250" width="6" height="5" rx="1.5" fill="#4a6a8a" />
			{/* row 11 */}
			<rect x="72" y="264" width="80" height="5" rx="1.5" fill="#c8d6e5" opacity="0.2" />
			<rect x="156" y="264" width="60" height="5" rx="1.5" fill="#c8d6e5" opacity="0.15" />
			{/* row 12 */}
			<rect x="72" y="278" width="28" height="5" rx="1.5" fill="#5cde5c" opacity="0.5" />
			<rect x="62" y="292" width="20" height="5" rx="1.5" fill="#5cde5c" opacity="0.4" />
			{/* cursor */}
			<rect x="62" y="300" width="6" height="10" rx="1" fill="#20a0c0">
				<animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
			</rect>

			{/* floating terminal panel inside screen */}
			<rect x="238" y="188" width="136" height="108" rx="6" fill="#080f18" stroke="#1e2d3d" strokeWidth="1" />
			<rect x="238" y="188" width="136" height="14" rx="6" fill="#0d1a28" />
			<rect x="238" y="195" width="136" height="7" fill="#0d1a28" />
			<circle cx="248" cy="195" r="3" fill="#3d1f1f" />
			<circle cx="257" cy="195" r="3" fill="#3d3010" />
			<circle cx="266" cy="195" r="3" fill="#1a3a1a" />
			<text x="274" y="198" fontSize="4.5" fill="#2a3d52" fontFamily="monospace">
				bash
			</text>
			<text x="244" y="213" fontSize="5" fill="#5cde5c" fontFamily="monospace">
				$ npm run dev
			</text>
			<text x="244" y="224" fontSize="5" fill="#3a5472" fontFamily="monospace">
				{" "}
				VITE v5.4.0 ready
			</text>
			<text x="244" y="235" fontSize="5" fill="#3a5472" fontFamily="monospace">
				{" "}
				➜ localhost:5173
			</text>
			<text x="244" y="246" fontSize="5" fill="#20a0c0" fontFamily="monospace">
				{" "}
				✓ 142 modules
			</text>
			<text x="244" y="257" fontSize="5" fill="#5cde5c" fontFamily="monospace">
				$
			</text>
			<rect x="252" y="253" width="4" height="7" rx="1" fill="#5cde5c">
				<animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
			</rect>
			<text x="244" y="288" fontSize="3.8" fill="#1e2d3d" fontFamily="monospace">
				✓ HMR enabled · port 5173
			</text>

			{/* ═══════════════════════════════════════════
			    DESK SURFACE
			    ═══════════════════════════════════════════ */}
			{/* monitor neck */}
			<rect x="196" y="326" width="28" height="14" rx="3" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* monitor base foot */}
			<rect x="168" y="340" width="84" height="8" rx="4" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />

			{/* desk surface — long plank */}
			<rect x="0" y="348" width="420" height="10" rx="3" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* desk edge shadow line */}
			<rect x="0" y="358" width="420" height="2" rx="0" fill="#080f18" opacity="0.7" />

			{/* ── desk items LEFT of keyboard ── */}
			{/* coffee mug */}
			<rect x="28" y="326" width="22" height="24" rx="4" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* mug handle */}
			<path d="M50 332 Q60 332 60 338 Q60 344 50 344" stroke="#1e2d3d" strokeWidth="1" fill="none" />
			{/* mug liquid */}
			<rect x="30" y="328" width="18" height="6" rx="2" fill="#1a2a1a" opacity="0.8" />
			{/* steam lines */}
			<path d="M35 324 Q36 320 35 316" stroke="#1e2d3d" strokeWidth="0.8" fill="none" opacity="0.6">
				<animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
			</path>
			<path d="M41 323 Q42 319 41 315" stroke="#1e2d3d" strokeWidth="0.8" fill="none" opacity="0.6">
				<animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
			</path>
			<path d="M47 324 Q48 320 47 316" stroke="#1e2d3d" strokeWidth="0.8" fill="none" opacity="0.5">
				<animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.4s" repeatCount="indefinite" />
			</path>

			{/* small plant pot */}
			<rect x="8" y="330" width="16" height="18" rx="2" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="0.8" />
			{/* plant stems */}
			<path d="M16 330 Q12 322 10 316" stroke="#1a3a1a" strokeWidth="1.2" fill="none" />
			<path d="M16 330 Q20 320 22 313" stroke="#1a3a1a" strokeWidth="1.2" fill="none" />
			<path d="M16 330 Q16 320 16 312" stroke="#1a3a1a" strokeWidth="1.2" fill="none" />
			<ellipse cx="10" cy="314" rx="5" ry="3" fill="#1a3a1a" />
			<ellipse cx="22" cy="311" rx="5" ry="3" fill="#1a3a1a" />
			<ellipse cx="16" cy="310" rx="4" ry="3" fill="#2d6a2d" />

			{/* ── keyboard ── */}
			<rect x="108" y="357" width="204" height="30" rx="5" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* function row */}
			{Array.from({ length: 13 }).map((_, i) => (
				<rect key={`f${i}`} x={112 + i * 15} y={360} width="11" height="6" rx="1.5" fill="#0f1923" stroke="#1e2d3d" strokeWidth="0.5" />
			))}
			{/* main rows */}
			{[0, 1].map((row) =>
				Array.from({ length: 12 }).map((_, col) => (
					<rect
						key={`r${row}-${col}`}
						x={112 + col * 16}
						y={369 + row * 11}
						width="12"
						height="8"
						rx="1.5"
						fill="#0f1923"
						stroke="#1e2d3d"
						strokeWidth="0.5"
					/>
				)),
			)}
			{/* spacebar */}
			<rect x="148" y="380" width="124" height="8" rx="2" fill="#0f1923" stroke="#1e2d3d" strokeWidth="0.5" />

			{/* ── mouse ── */}
			<rect x="322" y="355" width="26" height="34" rx="13" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* mouse split line */}
			<line x1="335" y1="355" x2="335" y2="368" stroke="#1e2d3d" strokeWidth="0.8" />
			{/* scroll wheel */}
			<rect x="332" y="362" width="6" height="10" rx="3" fill="#1e2d3d" />
			{/* mouse cable */}
			<path d="M335 355 Q335 348 328 340 Q322 332 330 326" stroke="#1e2d3d" strokeWidth="0.8" fill="none" strokeDasharray="2 1" />

			{/* sticky note */}
			<rect x="358" y="330" width="36" height="32" rx="2" fill="#1a2a1a" stroke="#2d6a2d" strokeWidth="0.8" />
			<rect x="361" y="336" width="24" height="3" rx="1" fill="#2d6a2d" opacity="0.6" />
			<rect x="361" y="342" width="20" height="3" rx="1" fill="#2d6a2d" opacity="0.4" />
			<rect x="361" y="348" width="26" height="3" rx="1" fill="#2d6a2d" opacity="0.5" />
			<rect x="361" y="354" width="16" height="3" rx="1" fill="#2d6a2d" opacity="0.3" />

			{/* ═══════════════════════════════════════════
			    BOTTOM AREA — heatmap preview strip
			    ═══════════════════════════════════════════ */}
			<rect x="20" y="400" width="380" height="72" rx="8" fill="#0d1a28" stroke="#1e2d3d" strokeWidth="1" />
			{/* header */}
			{/* <rect x="30" y="420" width="360" height="1" fill="#1e2d3d"/> */}
		</svg>
	</div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
const LandingPage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user) navigate("/dashboard", { replace: true });
	}, [user]);

	return (
		<div className="landing-root">
			<Spacebackground />
			<div className="landing-grid-bg" aria-hidden="true" />

			<Navbar />

			<div className="landing-mobile-msg">
				<span>Aspect ratio not supported.</span>
				<span>Please use a tablet or a computer.</span>
			</div>

			<main className="landing-main">
				<div className="landing-cols">
					{/* LEFT */}
					<div className="landing-left">
						<h1 className="landing-headline">
							<span className="headline-line">
								How <span className="landing-accent">students</span> track,
							</span>
							<span className="headline-line">
								practice &amp; <span className="landing-accent">improve</span>
							</span>
							<span className="headline-line with-ai">with AI</span>
						</h1>

						<p className="landing-sub">
							Combines AI tools, IDE functionalities, and analytics to enhance your learning — free access for all students.
						</p>

						<div className="landing-stats">
							<div className="lstat">
								<span className="lstat-value">10k+</span>
								<span className="lstat-label">Students</span>
							</div>
							<div className="lstat-div" />
							<div className="lstat">
								<span className="lstat-value">DSA</span>
								<span className="lstat-label">+ Dev tracking</span>
							</div>
							<div className="lstat-div" />
							<div className="lstat">
								<span className="lstat-value">Free</span>
								<span className="lstat-label">Always</span>
							</div>
						</div>

						<div className="landing-cta-row">
							<button className="cta-primary">Get started</button>
							<button className="cta-secondary">Sign in →</button>
						</div>
					</div>

					{/* RIGHT — full desk scene */}
					<div className="landing-right">
						<DeskScene />
					</div>
				</div>
			</main>
		</div>
	);
};

export default LandingPage;
