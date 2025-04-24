'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


export default function Navbar() {

    const router = useRouter()
    const [username, setUsername] = useState('')

    useEffect(() => {
        // Fetch username from local storage
        const storedUser = JSON.parse(localStorage.getItem('mockUser'));
        if (storedUser && storedUser.name) {
            setUsername(storedUser.name); // Update the username state
        }
    }, []); // Runs once when the component mounts

    const handleLogout =()=>{
        localStorage.removeItem('mockUser')
        setUsername('')
        router.push('/') 

    }
    
    return(
        <nav 
        className="bg-white shadow px-6 py-4 flex justify-between items-center">
            
            <h1 
            onClick={()=> router.push('/')}
            className="text-xl font-bold cursor-pointer">
                MockTestApp
            </h1>

            <div className="space-x-4">
            {/* {condition && <div>Show this only if true</div>} */}
                {username ? (
                
                // Show these options when the user is logged in
                <>
                <span className="text-gray-800">Welcome, {username} 🙌 </span> 

                <button 
                onClick={()=> router.push('/dashboard')}
                className="text-red-600 hover:underline">
                    Dashboard  
                </button>
                
                <button
                onClick={handleLogout}
                className="text-red-600 hover:underline">
                Logout
                </button>
                </>

                ) : (

                // Show these options when the user is not logged in
                    <>
                <button 
                onClick={()=> router.push('/auth/register')}
                className="text-blue-600 hover:underline" >
                    Register
                </button>

                <button 
                onClick={()=> router.push('/auth/login')}
                className="text-blue-600 hover:underline" >
                    Login
                </button>
                </>
                )}  
            </div>
        </nav>
    )
}