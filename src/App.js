import "./App.css"
import Home from "./pages/Home";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import RoomPage from "./pages/Room";
import { AuthContext } from "./helpers/AuthContext";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast"
import axios from "axios";
import io from "socket.io-client"
import RoomCall from "./pages/RoomCall";

const socket = io.connect("http://localhost:3001")

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });

  useEffect(() => {
    const getUserIdentity = async () => {
      await axios.get("http://localhost:3001/users/auth", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      }).then((response) => {
        if (response.data.error) {
          setAuthState({ ...authState, status: false });
        } else {
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true,
          });
        }
      });
    }

    getUserIdentity()
  }, [])

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false });
    toast.success("Logout successfully!")
  };
  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <Router>
        <div className="bg-cyan-500 h-[60px] flex justify-evenly items-center">
          {!authState.status ? (
            <>
              <Link to="/" className="hover:text-white text-2xl">Home</Link>
              <Link to="/login" className="hover:text-white text-2xl"> Login</Link>
              <Link to="/registration" className="hover:text-white text-2xl"> Registration</Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-white text-2xl">Home</Link>
              <h3 className="text-2xl">Welcome to Chat App, {authState.username}</h3>
              <button onClick={logout} className="h-[52px] w-[100px] bg-blue-400 hover:bg-blue-600 text-white flex items-center justify-center rounded-xl">
                Logout
              </button>
            </>
          )}
        </div>
        <Routes>
          <Route path="/" exact element={<Home socket={socket} />} />
          <Route path="/room/:id" exact element={<RoomPage socket={socket} />} />
          <Route path="/roomcall/:id" exact element={<RoomCall socket={socket} />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/registration" exact element={<Registration />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthContext.Provider>
  );
}

export default App;
