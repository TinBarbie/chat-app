import React, { useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import toast from "react-hot-toast";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setAuthState } = useContext(AuthContext);

    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { username: username, password: password };
        try {
            await axios.post("http://localhost:3001/users/login", data).then((response) => {
                console.log(response.data);
                if (response.data.error) {
                    alert(response.data.error);
                } else {
                    toast.success("Login successfully!")
                    localStorage.setItem("accessToken", response.data.token);

                    setTimeout(() => {
                        setAuthState({
                            username: response.data.username,
                            id: response.data.id,
                            status: true,
                        });
                        navigate("/");
                    }, 2000)
                }
            });
        } catch (error) {
            toast.error(error.response.data.error);
        }
    };
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-cyan-200">
            <h1 className="text-red-400 text-[52px] pb-10">Login Page</h1>
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
                <button type="submit" className="h-[52px] w-[100px] bg-blue-400 hover:bg-blue-600 text-white flex items-center justify-center rounded-xl">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
