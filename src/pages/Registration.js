import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import toast from "react-hot-toast";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [retypePW, setRetypePW] = useState("");
    const { setAuthState } = useContext(AuthContext);

    let navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== retypePW) {
            toast.error("Password and retyped password are incorrect! Please try again!")
            console.log(username, password);
            return;
        }
        const data = { username: username, password: password };
        axios.post("http://localhost:3001/users", data).then((response) => {
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                toast.success("Successfully create an account!")
                setTimeout(() => {
                    navigate("/login");
                }, 2000)
            }
        });
    };
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-cyan-200">
            <h1 className="text-red-400 text-[52px] pb-10">Registration Page</h1>
            <form className="flex flex-col items-center gap-5" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between w-[400px]">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        placeholder="Input username"
                        className="h-[60px] w-[250px] px-3"
                        onChange={(e) => { setUsername(e.target.value) }} />
                </div>
                <div className="flex items-center justify-between w-[400px]">
                    <label htmlFor="username">Password:</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Input password"
                        className="h-[60px] w-[250px] px-3"
                        onChange={(e) => { setPassword(e.target.value) }} />
                </div>
                <div className="flex items-center justify-between w-[400px]">
                    <label htmlFor="username">Retype password:</label>
                    <input
                        type="password"
                        name="retypePW"
                        id="retypePW"
                        placeholder="Input password again"
                        className="h-[60px] w-[250px] px-3"
                        onChange={(e) => { setRetypePW(e.target.value) }} />
                </div>
                <button type="submit" className="h-[52px] w-[100px] bg-blue-400 hover:bg-blue-600 text-white flex items-center justify-center rounded-xl">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
