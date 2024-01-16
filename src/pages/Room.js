import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import toast from "react-hot-toast";
import { ArrowDownToLine } from "lucide-react"

const RoomPage = ({ socket }) => {
    let { id } = useParams();
    let listOfColors = ["text-red-500", "text-blue-500", "text-yellow-500", "text-green-500"]
    const { authState } = useContext(AuthContext);

    const [chats, setChats] = useState([])
    const [description, setDescription] = useState("")
    const [uploadedFile, setUploadedFile] = useState()
    const [room, setRoom] = useState("")
    const [currentUsers, setCurrentUsers] = useState([])
    const chatRef = useRef(null)
    const fileRef = useRef(null)
    const lastMessageRef = useRef(null);
    const navigate = useNavigate()

    useEffect(() => {
        const getChatsByRoomId = async (roomId) => {
            await axios.get(process.env.REACT_APP_BACKEND_URL + `chats/${roomId}`).then((res) => {
                if (res.data) {
                    const chatList = res.data.map(data => {
                        let chatInstance = {
                            room: data.Room.name,
                            author: data.User.name
                        }
                        if (data.description) {
                            chatInstance.message = data.description
                        } else {
                            chatInstance.filename = data.filename
                            chatInstance.originalName = data.originalName
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
    }, [id])

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
        let formToSubmit = new FormData()
        formToSubmit.append("userId", authState.id)
        formToSubmit.append("roomId", room.id)

        let messageData

        if (!uploadedFile) {
            if (chatRef.current) {
                chatRef.current.value = ""
            }
            formToSubmit.append("description", description)
            messageData = {
                room: room.name,
                author: authState.username,
                message: description,
            }
        } else {
            formToSubmit.append("filename", uploadedFile)
            messageData = {
                room: room.name,
                author: authState.username,
                originalName: uploadedFile.name,
            }
        }

        await axios.post(process.env.REACT_APP_BACKEND_URL + `chats`, formToSubmit).then((res) => {
            if (!res.data.error) {
                messageData.filename = res.data.filename
                setChats((chats) => [...chats, messageData])
            }
        }).catch(() => {
            toast.error("Your upload file is over 1MB! Upload again with limited one")
            fileRef.current.value = null
        }).finally(() => {
            toast.success("Message is sent!")
        })
        await socket.emit("send_message", messageData)

        setUploadedFile(null)

        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
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

    const handleUploadFile = (e) => {
        e.preventDefault()
        document.getElementById("file-upload").click()
    }

    function getFileName(filepath) {
        if (!filepath.includes("\\")) return filepath
        return filepath.split("\\")[1]
    }

    async function handleDownloadFile(filenameToDL, filename) {
        console.log(filename);
        const headers = new Headers();
        headers.append('Content-Disposition', `attachment; filename="${filename}"`);
        fetch(`${process.env.REACT_APP_BACKEND_URL}${filenameToDL}`, {
            headers: headers
        })
            .then(res => res.blob())
            .then(blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
            })
    }

    return (

        <div className="min-w-screen min-h-screen bg-gradient-to-b from-cyan-200 to-cyan-500 md:px-10 px-4">
            <div className="flex flex-col items-center gap-10">
                {authState.status ? (
                    <>
                        <h1 className="text-red-400 text-[52px]">
                            {room.name}
                        </h1>
                        <div className="flex max-md:flex-col max-md:gap-4 w-full">
                            <div className="md:w-[800px] w-full flex flex-col gap-4">
                                <h3 className="text-red-400 text-[32px]">
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
                            <div className="md:min-w-[450px] md:w-[500px] w-full h-[400px] overflow-y-scroll flex border border-solid border-blue-500 px-2 py-5">
                                <div className="flex flex-col items-center gap-2 w-full">
                                    {chats.map((chat, id) => (
                                        <div key={id} ref={id === chats.length - 1 ? lastMessageRef : null} className="flex items-center w-full justify-between">
                                            <p className={`${listOfColors[id % 4]}`}>
                                                {chat.author}:
                                            </p>
                                            <div className="h-10 flex-1 md:w-[350px] min-w-[200px] w-full rounded-2xl p-2 flex items-center justify-end gap-4">
                                                <button
                                                    onClick={() => handleDownloadFile(chat.filename, getFileName(chat.originalName))}
                                                    className={`${chat.message ? "hidden" : ""} h-10 w-10 bg-gray-300 hover:bg-gray-100 flex items-center justify-center rounded-lg`}>
                                                    <ArrowDownToLine size={20} />
                                                </button>
                                                <p className={`${listOfColors[id % 4]} text-right max-w-[200px]`}>
                                                    {chat.message ? chat.message : getFileName(chat.originalName)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <form className="flex items-center md:justify-evenly max-md:flex-col gap-4 w-full pb-[52px]" onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="flex items-center gap-5">
                                    <label htmlFor="description">
                                        Input Message
                                    </label>
                                    <textarea
                                        ref={chatRef}
                                        type="text"
                                        name="description"
                                        id="description"
                                        placeholder="Input message"
                                        className="h-[60px] w-[250px]"
                                        onChange={(e) => { setDescription(e.target.value) }} />
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <label htmlFor="file-upload">
                                        Upload File
                                    </label>
                                    <button
                                        onClick={handleUploadFile}
                                        className="cursor-pointer h-[52px] w-[100px] bg-green-400 hover:bg-green-600 text-white flex items-center justify-center rounded-xl">
                                        Choose File
                                    </button>
                                    <input ref={fileRef} type="file" id="file-upload" hidden onChange={(e) => { setUploadedFile(e.target.files[0]) }} />
                                    {uploadedFile && (
                                        <p className="overflow-ellipsis">{uploadedFile.name}</p>
                                    )}
                                </div>

                                <button type="submit"
                                    className={`${(description === "" && !uploadedFile) ? "bg-gray-400 cursor-default" : "cursor-pointer bg-blue-400 hover:bg-blue-600"} h-[52px] md:w-[100px] w-[200px] text-white flex items-center justify-center rounded-xl`}>
                                    Send
                                </button>
                            </form>
                            <div className="flex justify-center gap-10 w-full">
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