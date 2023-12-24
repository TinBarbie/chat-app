import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import toast from "react-hot-toast";


const RoomPage = ({ socket }) => {
    let { id } = useParams();
    let listOfColors = ["text-red-500", "text-blue-500", "text-yellow-500", "text-green-500"]
    const { authState } = useContext(AuthContext);

    const [chats, setChats] = useState([])
    const [description, setDescription] = useState("")
    const [room, setRoom] = useState("")
    const [currentUsers, setCurrentUsers] = useState([])
    const chatRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const getChatsByRoomId = async (roomId) => {
            await axios.get(process.env.REACT_APP_BACKEND_URL + `chats/${roomId}`).then((res) => {
                if (res.data) {
                    const chatList = res.data.map(data => {
                        const chatInstance = {
                            room: data.Room.name,
                            author: data.User.name,
                            message: data.description
                        }
                        return chatInstance
                    })
                    setChats(chatList)
                }
            })
        }

        const getRoomById = async (roomId) => {
            await axios.get(process.env.REACT_APP_BACKEND_URL + `rooms/${roomId}`).then((res) => {
                if (res.data) {
                    setRoom(res.data)
                    const users = res.data.Users.map((user) => {
                        return {
                            username: user.name,
                            userSocketId: user.Userrooms.userSocketId
                        }
                    });
                    let mergedArr = [...new Set([...currentUsers, ...users])]
                    setCurrentUsers(mergedArr);
                }
            })
        }

        getChatsByRoomId(id)
        getRoomById(id)
    }, [])

    useEffect(() => {
        socket.on("receive_message", (data) => {
            console.log("receive a message");
            setChats((chats) => [...chats, data])
        })

        socket.on("update_user", (data) => {
            toast.success(`${data.author} just joined the room`)
            setCurrentUsers((users) => [...users, {
                username: data.author,
                userSocketId: data.userSocketId
            }])
        })

        socket.on("kick_user", (data) => {
            toast.error(`${data.author} just left the room`)
            setCurrentUsers((users) => users.filter((user) => user.username !== data.author))
        })
        return () => {
            socket.removeListener('receive_message')
            socket.removeListener('update_user')
            socket.removeListener('kick_user')
        }
    }, [socket])
    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.success("Message is sent!")
        if (chatRef.current) {
            chatRef.current.value = ""
        }
        const messageData = {
            room: room.name,
            author: authState.username,
            message: description,
        }

        await axios.post(process.env.REACT_APP_BACKEND_URL + `chats`, {
            roomId: room.id,
            userId: authState.id,
            description: description
        }).then((res) => {
            if (!res.data.error) {
                setChats((chats) => [...chats, messageData])
            }
        })
        await socket.emit("send_message", messageData)

        var elem = document.getElementById('chatFrame');
        elem.scrollTop = elem.scrollHeight;
    }

    const handleLeaveRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(process.env.REACT_APP_BACKEND_URL + `rooms/userroom?userId=${authState.id}&roomId=${room.id}`)
        } catch (error) {
            console.log(error);
        }

        const userData = {
            room: room.name,
            author: authState.username,
        }

        await socket.emit("leave_room", userData)
        navigate("/")
    }

    const handleJoinCall = () => {
        navigate(`/roomcall/${room.id}`)
    }

    return (

        <div className="min-w-screen min-h-screen bg-gradient-to-b from-cyan-200 to-cyan-500 px-10">
            <div className="flex flex-col items-center gap-10">
                {authState.status ? (
                    <>
                        <h1 className="text-red-400 text-[52px]">
                            {room.name}
                        </h1>
                        <div className="flex w-full">
                            <div className="w-[800px] flex flex-col gap-4">
                                <h3 className="text-red-400 text-[32px] pb-10">
                                    current users in this room:
                                </h3>
                                {currentUsers.map((data, i) => (
                                    <div key={i} className="flex items-center gap-10">
                                        <p className={`${listOfColors[i % 4]} text-[32px]`}>
                                            {data.username}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div id="chatFrame" className="w-[500px] h-[400px] overflow-y-scroll flex border border-solid border-blue-500 px-2 py-5">
                                <div className="flex flex-col items-center gap-2">
                                    {chats.map((chat, id) => (
                                        <div key={id} className="flex items-center">
                                            <p className={`${listOfColors[id % 4]}`}>
                                                {chat.author}:
                                            </p>
                                            <div className="w-fit h-10 rounded-2xl p-2">
                                                <p className={`${listOfColors[id % 4]} text-right lg:w-[350px] w-[150px]`}>
                                                    {chat.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">

                            <form className="flex items-center gap-5 pb-[52px]" onSubmit={handleSubmit}>
                                <textarea
                                    ref={chatRef}
                                    type="text"
                                    name="description"
                                    id="description"
                                    placeholder="Input message"
                                    className="h-[60px] w-[250px]"
                                    onChange={(e) => { setDescription(e.target.value) }} />
                                <button type="submit" disabled={description === ""} className="cursor-pointer h-[52px] w-[100px] bg-blue-400 hover:bg-blue-600 text-white flex items-center justify-center rounded-xl">
                                    Send
                                </button>
                            </form>
                            <div className="flex gap-10 w-full">
                                <button onClick={handleJoinCall} className="cursor-pointer h-[52px] w-[200px] bg-amber-200 hover:bg-amber-400 text-black flex items-center justify-center rounded-xl">
                                    Join room video call
                                </button>
                                <button onClick={handleLeaveRoom} className="cursor-pointer h-[52px] w-[200px] bg-red-400 hover:bg-red-600 text-white flex items-center justify-center rounded-xl">
                                    Leave Room
                                </button>
                            </div>
                        </div>

                    </>
                ) : (
                    <h3 className="text-red-600 text-[32px]">
                        Log in to access Chat App
                    </h3>
                )}

            </div>
        </div>
    )
}

export default RoomPage