import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import ChatArea from "./components/main/ChatArea";

const App = () => {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default App;
