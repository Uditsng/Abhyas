import React from 'react'
import Image from 'next/image';

const LottieSection = () => {
  return (
    <div className="py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center">       
        
        {/* Left side - Illustration */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
            <Image 
            src="images/explore-pass__illust.svg" 
            alt="Student using test platform" 
            width={400}
            height={350}
            className="object-contain"
            />
        </div>
        
        {/* Right side - Content */}
        <div className="w-full md:w-1/2 ">
        <h2 className="text-2xl font-bold mb-4">Enroll in Test Series for 670+ exams with</h2>
        
        <div className="mb-4">
            <span className="text-2xl font-bold">MockTest</span>
            <span className="bg-blue-500 text-white px-2 py-1 ml-2 rounded">PASS</span>
        </div>

        <p className="mb-6">
            Get unlimited access to the most relevant Mock Tests, on India's Structured Online Test series platform
        </p>

          <h3 className="font-semibold mt-4">What you get with MockTestApp Pass</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg mr-2">
                <span>🏆</span>
              </div>
              <span>All India Rank</span>
            </div>

            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg mr-2">
                <span>📋</span>
              </div>
              <span>Latest Exam Patterns</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-2">
                <span>📊</span>
              </div>
              <span>In-depth Performance Analysis</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-2">
                <span>🌐</span>
              </div>
              <span>Multi-lingual Mock Tests</span>
            </div>
          </div>

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Explore MockTest Pass
          </button>
        </div>
    </div>
</div>
 
  )
}

export default LottieSection