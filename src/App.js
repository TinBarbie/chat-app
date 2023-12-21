import "./App.css"
import io from "socket.io-client"

const socket = io.connect("http://localhost:3001")

function App() {
  return (
    <div className="min-w-screen min-h-screen bg-gradient-to-b from-cyan-200 to-cyan-500">
      <div className="flex flex-col items-center">
        <h1 className="text-red-400 text-[52px] pb-10">
          Messenger App
        </h1>
        <h3 className="text-red-600 text-[32px]">
          List of chat rooms:
        </h3>
      </div>
    </div>
  );
}

export default App;
