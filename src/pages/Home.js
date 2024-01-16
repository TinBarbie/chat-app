import React, { useContext } from 'react'
import RoomList from '../components/RoomList'
import { AuthContext } from '../helpers/AuthContext';


const Home = ({ socket }) => {
    const { authState } = useContext(AuthContext);

    return (
        <div className="min-w-screen min-h-screen bg-gradient-to-b from-cyan-200 to-cyan-500">
            <div className="flex flex-col items-center gap-10 max-sm:px-4">
                {authState.status ? (
                    <>
                        <h1 className="text-red-400 text-[52px] pb-10">
                            Home Page
                        </h1>
                        <h3 className="text-red-600 text-[32px]">
                            List of chat rooms:
                        </h3>
                        <RoomList socket={socket} />
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

export default Home