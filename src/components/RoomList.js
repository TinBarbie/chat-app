import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../helpers/AuthContext"

const RoomList = ({ socket }) => {
    const [rooms, setRooms] = useState([])
    const { authState } = useContext(AuthContext);

    const navigate = useNavigate()
    useEffect(() => {
        const fetchRooms = async () => {
            await axios.get(process.env.REACT_APP_BACKEND_URL + "rooms").then((res) => {
                if (res.data) {
                    setRooms(res.data)
                }
            })
        }
        fetchRooms();
    }, [])

    const handleJoinRoom = async (room) => {
        await axios.post(process.env.REACT_APP_BACKEND_URL + "userrooms", {
            userId: authState.id,
            roomId: room.id,
            userSocketId: socket.id
        })
        const userData = {
            room: room.name,
            author: authState.username,
        }

        socket.emit("join_room", userData)
        navigate(`/room/${room.id}`)
    }
    return (
        <div className="sm:w-[400px] w-full flex flex-col gap-5">
            {rooms.map((room) => (
                <button
                    key={room.id}
                    onClick={() => { handleJoinRoom(room) }}
                    className="h-[56px] w-full bg-amber-200 hover:bg-amber-300 text-2xl flex items-center justify-center">
                    Get in {room.name}
                </button>
            ))}
        </div>
    )
}

export default RoomList