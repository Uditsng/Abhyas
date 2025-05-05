// Add responsive classes to the test container
<div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
  {/* Test header with responsive design */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{testData.title}</h1>
      <p className="text-gray-600 dark:text-gray-400">{testData.description}</p>
    </div>
    
    <div className="mt-4 sm:mt-0 flex items-center">
      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
        Time: {formatTime(timeRemaining)}
      </div>
    </div>
  </div>
  
  {/* Question card with dark mode support */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 transition-colors duration-200">
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Question {currentQuestionIndex + 1} of {testData.questions.length}
      </span>
      
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {currentQuestion.marks || 1} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
      </span>
    </div>
    
    <h2 className="text-lg sm:text-xl font-medium mb-4 text-gray-900 dark:text-gray-100">
      {currentQuestion.question}
    </h2>
    
    {/* Options with better mobile support */}
    <div className="space-y-3">
      {currentQuestion.options.map((option, index) => (
        <div 
          key={index}
          onClick={() => handleOptionSelect(index)}
          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors duration-200
                     ${selectedOptions[currentQuestionIndex] === index 
                       ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400' 
                       : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <div className={`w-5 h-5 border rounded-full flex items-center justify-center
                              ${selectedOptions[currentQuestionIndex] === index 
                                ? 'border-blue-500 dark:border-blue-400' 
                                : 'border-gray-400 dark:border-gray-500'}`}>
                {selectedOptions[currentQuestionIndex] === index && (
                  <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                )}
              </div>
            </div>
            <div className="ml-3">
              <span className={`text-base ${selectedOptions[currentQuestionIndex] === index 
                                ? 'text-gray-900 dark:text-gray-100 font-medium' 
                                : 'text-gray-700 dark:text-gray-300'}`}>
                {option}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  
  {/* Navigation buttons with better mobile layout */}
  <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
    <button
      onClick={handlePrevQuestion}
      disabled={currentQuestionIndex === 0}
      className="btn-secondary disabled:opacity-50"
    >
      Previous
    </button>
    
    <div className="flex space-x-3">
      <button
        onClick={handleMarkForReview}
        className={`btn-secondary ${markedForReview[currentQuestionIndex] ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : ''}`}
      >
        {markedForReview[currentQuestionIndex] ? 'Marked for Review' : 'Mark for Review'}
      </button>
      
      {currentQuestionIndex < testData.questions.length - 1 ? (
        <button
          onClick={handleNextQuestion}
          className="btn-primary"
        >
          Next
        </button>
      ) : (
        <button
          onClick={handleSubmitTest}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Submit Test
        </button>
      )}
    </div>
  </div>
  
  {/* Question palette for larger screens */}
  <div className="hidden md:block mt-8">
    <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Question Palette</h3>
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {testData.questions.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentQuestionIndex(index)}
          className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors duration-200
                     ${getQuestionStatusClass(index)}`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  </div>
  
  {/* Mobile question palette toggle */}
  <div className="md:hidden mt-6">
    <button 
      onClick={() => setShowMobilePalette(!showMobilePalette)}
      className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md flex items-center justify-center"
    >
      {showMobilePalette ? 'Hide Question Palette' : 'Show Question Palette'}
    </button>
    
    {showMobilePalette && (
      <div className="mt-3 grid grid-cols-5 sm:grid-cols-8 gap-2">
        {testData.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentQuestionIndex(index);
              setShowMobilePalette(false);
            }}
            className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors duration-200
                       ${getQuestionStatusClass(index)}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    )}
  </div>
</div>
