'use client'

import { useRouter } from "next/navigation"
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from "react"
import {auth} from '@/lib/firebase'

export default function Navbar() {

    const router = useRouter()
    const [username, setUsername] = useState(' ')
    const [loggedIn, setLoggedIn] = useState(false)

   
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setLoggedIn(true);
            setUsername( user.email);
          } else {
            setLoggedIn(false);
            setUsername('');
          }
        });
        return () => unsubscribe(); // Clean up the listener
    }, []);

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
                {username && <span className="text-gray-800">Welcome, {username} 🙌 </span> }

                <button 
                onClick={()=> router.push('/dashboard')}
                className="test-blue-600 hover:underline" >
                    Dashboard
                </button>

                <button 
                onClick={()=> router.push('/auth/login')}
                className="test-blue-600 hover:underline" >
                    Login
                </button>
            </div>
        </nav>
    )
}