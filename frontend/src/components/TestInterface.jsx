import React, { useState, useEffect } from 'react'
import { Play, Loader2, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react'

const TestInterface = ({ onTestComplete }) => {
  const [testCases, setTestCases] = useState([])
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('qwen/qwen-2.5-72b-instruct:free')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [predefinedCases, setPredefinedCases] = useState({})
  const [executingTestCases, setExecutingTestCases] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchPredefinedCases()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/test-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      } else {
        console.error('Failed to fetch categories:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchPredefinedCases = async () => {
    try {
      const response = await fetch('/api/v1/predefined-test-cases')
      if (response.ok) {
        const data = await response.json()
        setPredefinedCases(data.test_cases)
      } else {
        console.error('Failed to fetch predefined cases:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch predefined cases:', err)
    }
  }

  const addTestCase = () => {
    const newTestCase = {
      id: Date.now(),
      prompt: '',
      expected_response: '',
      category: 'prompt_understanding',
      description: '',
      timeout: 30
    }
    setTestCases([...testCases, newTestCase])
  }

  const removeTestCase = (id) => {
    setTestCases(testCases.filter(tc => tc.id !== id))
  }

  const updateTestCase = (id, field, value) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ))
  }

  const addPredefinedCases = (category) => {
    const cases = predefinedCases[category] || []
    const newCases = cases.map((testCase, index) => ({
      ...testCase,
      id: Date.now() + index
    }))
    setTestCases([...testCases, ...newCases])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // API key is now handled by the backend using settings

    if (testCases.length === 0) {
      setError('Please add at least one test case')
      return
    }

    setIsLoading(true)
    setError('')
    setResults(null)
    setExecutingTestCases([])

    // Prepare the test cases that will be executed
    const testCasesToExecute = testCases.map(tc => ({
      prompt: tc.prompt,
      expected_response: tc.expected_response || null,
      category: tc.category,
      description: tc.description,
      timeout: tc.timeout
    }))
    
    setExecutingTestCases(testCasesToExecute)

    try {
      console.log('Sending test suite request to:', '/api/v1/execute-tests')
      
             const requestData = {
         test_cases: testCasesToExecute,
         api_key: "dummy_key", // Backend will use settings API key
         model: model
       }
      
      console.log('Request data:', requestData)
      
      const response = await fetch('/api/v1/execute-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('Test suite response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Test suite error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const responseData = await response.json()
      console.log('Test suite response data:', responseData)
      setResults(responseData)
      
      // Show success message
      console.log('✅ Test suite completed successfully! Results have been saved.')
      
      // Trigger results refresh
      if (onTestComplete) {
        onTestComplete()
      }
    } catch (err) {
      console.error('Test suite error:', err)
      setError(err.message || 'An error occurred during testing')
    } finally {
      setIsLoading(false)
      setExecutingTestCases([])
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-error-600" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'passed':
        return 'status-passed'
      case 'failed':
        return 'status-failed'
      case 'error':
        return 'status-error'
      default:
        return 'status-pending'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Test Interface</h2>
        <p className="mt-1 text-gray-600">
          Create and execute comprehensive test suites for AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Configuration */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
            
                         <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Model
                 </label>
                 <select
                   value={model}
                   onChange={(e) => setModel(e.target.value)}
                   className="input-field"
                 >
                   <optgroup label="OpenAI Models">
                     <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                     <option value="gpt-4">GPT-4</option>
                     <option value="gpt-4-turbo">GPT-4 Turbo</option>
                   </optgroup>
                   <optgroup label="OpenRouter Models">
                     <option value="qwen/qwen-2.5-72b-instruct:free">Qwen 2.5 72B (Free)</option>
                     <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                     <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                     <option value="google/gemini-pro">Gemini Pro</option>
                   </optgroup>
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Predefined Test Cases
                 </label>
                 <div className="space-y-2">
                   {categories.map(category => (
                     <button
                       key={category.value}
                       onClick={() => addPredefinedCases(category.value)}
                       className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                     >
                       Add {category.description} Tests
                     </button>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Cases</h3>
              <button
                onClick={addTestCase}
                className="btn-secondary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </button>
            </div>

            {testCases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No test cases added yet.</p>
                <p className="text-sm">Add test cases manually or use predefined ones.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testCases.map((testCase, index) => (
                  <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Test Case {index + 1}</h4>
                      <button
                        onClick={() => removeTestCase(testCase.id)}
                        className="text-gray-400 hover:text-error-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prompt
                        </label>
                        <textarea
                          value={testCase.prompt}
                          onChange={(e) => updateTestCase(testCase.id, 'prompt', e.target.value)}
                          className="input-field h-20 resize-none"
                          placeholder="Enter test prompt..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Response (Optional)
                        </label>
                        <input
                          type="text"
                          value={testCase.expected_response}
                          onChange={(e) => updateTestCase(testCase.id, 'expected_response', e.target.value)}
                          className="input-field"
                          placeholder="Expected response pattern..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={testCase.category}
                          onChange={(e) => updateTestCase(testCase.id, 'category', e.target.value)}
                          className="input-field"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={testCase.description}
                          onChange={(e) => updateTestCase(testCase.id, 'description', e.target.value)}
                          className="input-field"
                          placeholder="Test description..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmit}
                                     disabled={isLoading || testCases.length === 0}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Test Suite ({testCases.length} tests)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executing Test Cases Display */}
      {executingTestCases.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Executing Test Suite</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                Executing {executingTestCases.length} test case{executingTestCases.length !== 1 ? 's' : ''}...
              </span>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-gray-600">Processing</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {executingTestCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Test Case {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse rounded-full h-2 w-2 bg-primary-600"></div>
                      <span className="text-xs text-gray-500">Executing</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-medium text-gray-700">Description:</span>
                      <p className="text-sm text-gray-600 mt-1">{testCase.description || 'No description'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-700">Category:</span>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{testCase.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-700">Prompt:</span>
                    <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-2">
                        {testCase.prompt}
                      </p>
                    </div>
                  </div>
                  
                  {testCase.expected_response && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-700">Expected Response:</span>
                      <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-2">
                          {testCase.expected_response}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error-800">Error</h3>
              <div className="mt-2 text-sm text-error-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {results.passed_tests}/{results.total_tests} passed
              </span>
              <span className="text-sm text-gray-600">
                {results.execution_time.toFixed(2)}s total
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {results.results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Test {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className={`status-badge ${getStatusClass(result.status)}`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Response Time:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {result.response_time.toFixed(2)}s
                    </span>
                  </div>
                  
                  {result.accuracy_score !== null && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Accuracy:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {(result.accuracy_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700">AI Response:</span>
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {result.actual_response || 'No response received'}
                    </p>
                  </div>
                </div>

                {result.error_message && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">Error:</span>
                    <div className="mt-1 p-3 bg-error-50 border border-error-200 rounded-md">
                      <p className="text-sm text-error-700">{result.error_message}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestInterface 