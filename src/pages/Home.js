import React, { useContext } from 'react'
import RoomList from '../components/RoomList'
import { AuthContext } from '../helpers/AuthContext';

export const Entry = ({ name, children, depth }) => {
    return (
        <>
            <p style={{ paddingLeft: `${depth * 20}px` }}>
                {name}
            </p>
            {children?.map((entry) => (
                <Entry name={entry.name} children={entry?.children} depth={depth + 1} />
            ))}
        </>
    )
}

const Home = ({ socket }) => {
    const { authState } = useContext(AuthContext);

    const files = [
        {
            name: "src",
            children: [
                {
                    name: "components",
                    children: [
                        {
                            name: "EXComp.tsx"
                        }
                    ]
                }
            ]
        },
        {
            name: "pages",
            children: [
                {
                    name: "Home.js",
                },
                {
                    name: "Login.js",
                },
                {
                    name: "Register.js",
                },
            ]
        },
    ]

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
                        {/* <p>Current browser tree:</p>
                        {files.map((entry) => (
                            <Entry name={entry.name} children={entry?.children} depth={1} />
                        ))} */}
                    </h3>
                )}
            </div>
        </div>
    )
}

export default Home