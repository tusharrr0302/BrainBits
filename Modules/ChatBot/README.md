# BrainBits - AI Chat Application

A fully functional AI chat web application built with React, Vite, and Google Gemini API. Features a beautiful dark-themed UI with smooth animations and real-time streaming responses.

## 🎨 Features

- **Modern Dark UI**: Beautiful gradient backgrounds with glassmorphism effects
- **Real-time Streaming**: Get AI responses streamed in real-time using Google Gemini API
- **Chat History**: Persistent chat history with localStorage
- **Search Functionality**: Search through your chat history
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Responsive Design**: Works on desktop and tablet devices
- **Typing Indicators**: Visual feedback during AI responses

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **AI API**: Google Gemini Pro
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Fonts**: Inter

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
npm install react-markdown remark-gfm
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

### 3. Start the Development Servers

You'll need to run both the frontend and backend servers:

**Terminal 1 - Backend Server:**

```bash
npm run server
```

**Terminal 2 - Frontend Development Server:**

```bash
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
ChatBot/
├── server/
│   └── index.js          # Express backend server
├── src/
│   ├── components/
│   │   ├── main/
│   │   │   ├── ChatArea.jsx      # Main chat interface
│   │   │   ├── MessageList.jsx   # Message display component
│   │   │   ├── Mascot.jsx        # Animated mascot character
│   │   │   └── TypingIndicator.jsx
│   │   └── sidebar/
│   │       └── Sidebar.jsx       # Sidebar with history
│   ├── store/
│   │   └── chatStore.js          # Zustand state management
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
└── README.md
```

## 🎯 Architecture

### Frontend Architecture

- **Component-Based**: Modular React components for maintainability
- **State Management**: Zustand store with localStorage persistence
- **API Communication**: Fetch API with streaming support
- **Styling**: Tailwind CSS utility classes for consistent design

### Backend Architecture

- **RESTful API**: Express server with `/api/chat` endpoint
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **Security**: API key stored server-side only
- **Error Handling**: Comprehensive error handling and logging

### Data Flow

1. User sends message → Frontend adds to store
2. Frontend sends request to backend `/api/chat`
3. Backend calls Gemini API with conversation context
4. Backend streams response chunks to frontend
5. Frontend updates UI in real-time as chunks arrive
6. Chat history persisted to localStorage

## 🎨 UI Components

### Sidebar

- BrainBits logo with brain icon
- Search bar for filtering chats
- "New Chat" button
- Scrollable chat history with arrow indicators

### Main Chat Area

- Animated mascot character (when no messages)
- "How can I help you today?" greeting
- Message list with user/assistant distinction
- Input field with plus button (left) and mic button (right)
- Share button (top right when messages exist)

## 🔧 Configuration

### Vite Proxy

The Vite dev server is configured to proxy `/api` requests to the backend server (port 3001). This is configured in `vite.config.js`.

### Tailwind Configuration

Custom colors and fonts are defined in `tailwind.config.js`:

- Dark theme colors
- Inter font family
- Custom accent colors

## 🐛 Troubleshooting

### API Key Issues

- Ensure your `.env` file is in the root directory
- Verify your Gemini API key is valid
- Check that the backend server is running

### CORS Errors

- The backend includes CORS middleware
- Ensure both servers are running on the correct ports

### Streaming Not Working

- Check browser console for errors
- Verify backend is receiving requests
- Check Gemini API quota/limits

## 📝 Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run server` - Start backend server
- `npm run preview` - Preview production build

## 🔒 Security Notes

- Never commit your `.env` file
- API keys should only be used server-side
- The backend handles all Gemini API calls
- Frontend never directly accesses the API key

## 🚀 Production Deployment

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform

3. Deploy both frontend (static files) and backend (Node.js server)

4. Update API URLs if needed (currently uses proxy in dev)

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, Vite, and Google Gemini AI
