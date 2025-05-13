import React from 'react'
import { FaBook, FaVideo, FaFileAlt, FaClock, FaQuestionCircle, FaClipboardList } from 'react-icons/fa'

const ExploreSuperCoaching = () => {
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors duration-200">
      <div className="container mx-auto px-4">
        {/* Header section */}
        <div className="container mx-auto p-12 mb-10 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors duration-200">
          <h2 className="flex items-center text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            <span className="border-l-4 border-red-500 dark:border-red-400 pr-2"></span>
            <span className="text-red-500 dark:text-red-400">Super</span>coaching
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-200">
            with India's Super Duper Teachers <span className="underline text-black dark:text-white font-semibold">Crack any government exam</span>
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center transition-colors duration-200">
            <div className="text-red-500 dark:text-red-400 mr-4">
              <FaBook className="h-8 w-8" />
            </div>
            <div className="text-gray-800 dark:text-gray-200">Courses by Super Duper Teachers</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center transition-colors duration-200">
            <div className="text-red-500 dark:text-red-400 mr-4">
              <FaVideo className="h-8 w-8" />
            </div>
            <div className="text-gray-800 dark:text-gray-200">Daily Live Classes by Experts</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center transition-colors duration-200">
            <div className="text-red-500 dark:text-red-400 mr-4">
            <FaFileAlt className="h-8 w-8" />
            </div>
            <div className="text-gray-800 dark:text-gray-200">Complete Study Material</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center transition-colors duration-200">
            <div className="text-red-500 dark:text-red-400 mr-4">
            <FaClock className="h-8 w-8" />
            </div>
            <div className="text-gray-800 dark:text-gray-200">Practice Questions</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center transition-colors duration-200">
            <div className="text-red-500 dark:text-red-400 mr-4">
            <FaQuestionCircle className="h-8 w-8" />
            </div>
            <div className="text-gray-800 dark:text-gray-200">Quick Doubt Resolution by Experts</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg flex items-center transition-colors duration-200">
            <div className="text-red-500 dark:text-red-400 mr-4">
            <FaClipboardList className="h-8 w-8" />
            </div>
            <div className="text-gray-800 dark:text-gray-200">Access to 50,000+ Mock Test</div>
          </div>
        </div>

        {/* Button */}
        <div className="text-center">
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-md transition-colors duration-200">
            Explore Super-DuperCoaching
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExploreSuperCoaching
