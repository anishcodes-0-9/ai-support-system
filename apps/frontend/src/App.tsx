import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <div
      className="min-h-screen bg-red-500
 flex items-center justify-center"
    >
      <div className="min-h-screen bg-green-500 flex items-center justify-center">
        <ChatWindow />
      </div>
    </div>
  );
}
