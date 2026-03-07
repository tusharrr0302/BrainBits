import ChatBotChatArea from "../ui/ChatBotChatArea";
import ChatBotSidebar from "../ui/ChatBotSidebar";

const AIChatBot = () => {
	return (
		<div style={{ display: "flex", width: "100vw", height: "100vh" }}>
			<ChatBotChatArea />
			<ChatBotSidebar />
		</div>
	);
};

export default AIChatBot;
