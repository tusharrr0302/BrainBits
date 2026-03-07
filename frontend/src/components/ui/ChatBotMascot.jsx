import { motion } from "framer-motion";
import styles from "./Mascot.module.css";

const ChatBotMascot = () => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5 }}
			className={styles.mascotContainer}
		>
			<motion.div
				animate={{ y: [0, -15, 0] }}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className={styles.floatingWrapper}
			>
				<img src="/assets/mascot.png" alt="BrainBits Mascot" className={styles.mascotImage} />
			</motion.div>
		</motion.div>
	);
};

export default ChatBotMascot;
