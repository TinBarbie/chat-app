import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom";

const RoomCall = ({ socket }) => {
    let { id } = useParams();
    const [room, setRoom] = useState("")
    const [stream, setStream] = useState()

    const myVideo = useRef()

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })

    }, [])

    useEffect(() => {
        const getRoomById = async (roomId) => {

            await axios.get(process.env.REACT_APP_BACKEND_URL + `rooms/${roomId}`).then((res) => {
                if (res.data) {
                    setRoom(res.data)
                }
            })
        }
        getRoomById(id)
    }, [])
    return (
        <div className="flex flex-col items-center min-w-screen min-h-screen bg-gradient-to-b from-cyan-200 to-cyan-500 px-10">
            <h1 className="text-[52px] text-red-400">Video Call {room.name}</h1>
            {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
        </div>
    )
}

export default RoomCall