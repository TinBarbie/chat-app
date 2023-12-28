import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import Peer from "simple-peer";
import { toast } from "react-hot-toast"

const RoomCall = ({ socket }) => {
    let { id } = useParams();
    let listOfColors = ["text-red-500", "text-blue-500", "text-yellow-500", "text-green-500"]
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate()

    const [room, setRoom] = useState("");
    const [stream, setStream] = useState();
    const [me, setMe] = useState("")
    const [currentUsers, setCurrentUsers] = useState([]);
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState("")
    const myVideo = useRef(null)
    const userVideo = useRef(null)
    const connectionRef = useRef()

    useEffect(() => {
        const getRoomById = async (roomId) => {
            await axios.get(`http://localhost:3001/rooms/${roomId}`).then((res) => {
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

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            if (myVideo.current) myVideo.current.srcObject = stream
        })

        getRoomById(id)
        setMe(socket.id)

        socket.on("call_user", (data) => {
            console.log("receiving call from: ", data.name)
            setReceivingCall(true)
            setCaller(data.from)
            setName(data.name)
            setCallerSignal(data.signal)
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
            if (connectionRef.current) {
                connectionRef.current = null
                setCallAccepted(false)
                setCallEnded(true)
            }
        })

        socket.on("end_call", () => {
            connectionRef.current = null
            setCallAccepted(false)
            setCallEnded(true)
        })

        return () => {
            socket.removeListener('me')
            socket.removeListener('call_user')
            socket.removeListener('update_user')
            socket.removeListener('kick_user')
            socket.removeListener("end_call")
        }
    }, [])

    useEffect(() => {
        if (!userVideo.current && callAccepted && !callEnded) {
            console.log("caller has ended the call")
            setCallEnded(true)
            setCallAccepted(false)
            connectionRef.current = null
        }
    }, [userVideo])

    const callUser = (id, myname, username) => {
        setIdToCall(id)
        setName(username)
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("call_user", {
                userToCall: id,
                signalData: data,
                from: me,
                name: myname
            })
        })
        peer.on("stream", (uStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = uStream
            }
        })
        socket.on("call_accepted", (signal) => {
            setCallAccepted(true)
            peer.signal(signal)
        })

        connectionRef.current = peer
    }

    const answerCall = () => {
        setIdToCall(caller)
        setReceivingCall(false)
        setCallAccepted(true)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("answer_call", { signal: data, to: caller })
        })
        peer.on("stream", (uStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = uStream
            }
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    }

    const cancelCall = () => {
        setCallAccepted(false)
        setCallEnded(true)
        connectionRef.current = null
        socket.emit("end_call", idToCall)
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

    return (
        <div className="flex flex-col min-w-screen min-h-screen bg-gradient-to-b from-cyan-200 to-cyan-500 px-10">
            <h1 className="text-[52px] text-red-400 mx-auto">Video {room.name}</h1>
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
                            {data.username.toLowerCase() !== authState.username.toLowerCase() && (
                                <>
                                    <button onClick={() => callUser(data.userSocketId, authState.username, data.username)} className="cursor-pointer h-[52px] w-[100px] bg-amber-200 hover:bg-amber-400 text-black flex items-center justify-center rounded-xl">
                                        Call
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-center gap-4 border border-solid border-[#333]">
                    <div>
                        {receivingCall && !callAccepted ? (
                            <>
                                <h1 >{name} is calling...</h1>
                                <button onClick={answerCall} className="cursor-pointer h-[52px] w-[100px] bg-green-200 hover:bg-green-400 text-black flex items-center justify-center rounded-xl">
                                    Answer Call
                                </button>
                            </>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="flex flex-col items-center">
                            <h3 className="text-2xl text-red-400">
                                {authState.username}
                            </h3>
                            {stream && <video playsInline muted ref={myVideo} autoPlay className="w-[300px] h-auto" />}
                        </div>

                        {(callAccepted && !callEnded) ? (
                            <div className="flex flex-col items-center">
                                <h3 className="text-2xl text-blue-400">
                                    {name}
                                </h3>
                                <video playsInline ref={userVideo} autoPlay className="w-[300px]" />
                            </div>
                        ) : null}
                    </div>
                    {(callAccepted && !callEnded) ? (
                        <button onClick={cancelCall} className="cursor-pointer h-[52px] w-[200px] bg-red-200 hover:bg-red-400 text-black flex items-center justify-center rounded-xl">
                            Cancel Call
                        </button>
                    ) : null}
                </div>
            </div>
            <button onClick={handleLeaveRoom} className="mx-auto mt-10 cursor-pointer h-[52px] w-[200px] bg-red-400 hover:bg-red-600 text-white flex items-center justify-center rounded-xl">
                Leave Room
            </button>
        </div>
    )
}

export default RoomCall