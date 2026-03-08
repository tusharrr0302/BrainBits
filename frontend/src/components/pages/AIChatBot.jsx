import { Space } from "lucide-react";
import ChatBotChatArea from "../ui/ChatBotChatArea";
import ChatBotSidebar from "../ui/ChatBotSidebar";
import SpaceBackground from "../ui/Spacebackground";

const AIChatBot = () => {
	return (
		<div style={{ display: "flex", width: "100vw", height: "100vh" }}>
			<SpaceBackground />
			<ChatBotChatArea />
			<ChatBotSidebar />
		</div>
	);
};

export default AIChatBot;
