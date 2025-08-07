import React, { useState } from 'react'
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react'

const TestForm = ({ onTestComplete }) => {
  const [prompt, setPrompt] = useState('')
  const [webPageUrl, setWebPageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [currentTestCase, setCurrentTestCase] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim() || !webPageUrl.trim()) {
      setError('Please provide both prompt and web page URL')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)
    setCurrentTestCase(null)

    // Create the test case that will be executed
    const testCase = {
      prompt: prompt.trim(),
      web_page_url: webPageUrl.trim(),
      description: "Quick test",
      category: "prompt_understanding",
      enhanced_prompt: `Web Page: ${webPageUrl.trim()}\n\nTest Prompt: ${prompt.trim()}`
    }
    
    setCurrentTestCase(testCase)

    try {
      console.log('Sending request to:', '/api/v1/quick-test')
      console.log('Request data:', { prompt: prompt.trim(), web_page_url: webPageUrl.trim() })
      
      // Test with fetch first to see if it's an axios issue
      const fetchResponse = await fetch('/api/v1/quick-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          web_page_url: webPageUrl.trim()
        })
      })
      
      console.log('Fetch response status:', fetchResponse.status)
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text()
        console.error('Fetch error response:', errorText)
        throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`)
      }
      
      const responseData = await fetchResponse.json()
      console.log('Fetch response data:', responseData)
      setResult(responseData)
      
      // Show success message
      console.log('✅ Test completed successfully! Results have been saved.')
      
      // Trigger results refresh
      if (onTestComplete) {
        onTestComplete()
      }
    } catch (err) {
      console.error('Error details:', err)
      setError(err.message || 'An error occurred during testing')
    } finally {
      setIsLoading(false)
      setCurrentTestCase(null)
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input-field h-24 resize-none"
            placeholder="Enter your test prompt here..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Web Page URL
          </label>
          <input
            type="url"
            value={webPageUrl}
            onChange={(e) => setWebPageUrl(e.target.value)}
            className="input-field"
            placeholder="https://example.com"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center justify-center w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Test
            </>
          )}
        </button>
      </form>

      {/* Current Test Case Display */}
      {currentTestCase && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Executing Test Case</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Test Description:</span>
                <p className="text-sm text-gray-600 mt-1">{currentTestCase.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <p className="text-sm text-gray-600 mt-1 capitalize">{currentTestCase.category.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">Web Page URL:</span>
              <p className="text-sm text-gray-600 mt-1 break-all">{currentTestCase.web_page_url}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">Test Prompt:</span>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{currentTestCase.prompt}</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">Enhanced Prompt (sent to AI):</span>
              <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{currentTestCase.enhanced_prompt}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-gray-600">Executing test case...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <p className="text-error-800 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className={`status-badge ${getStatusClass(result.status)}`}>
                {getStatusIcon(result.status)}
                <span className="ml-1 capitalize">{result.status}</span>
              </div>
            </div>
            
            {result.response_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Response Time:</span>
                <span className="text-sm text-gray-600">{result.response_time.toFixed(2)}s</span>
              </div>
            )}
            
            {result.accuracy_score !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Accuracy Score:</span>
                <span className="text-sm text-gray-600">{(result.accuracy_score * 100).toFixed(1)}%</span>
              </div>
            )}
            
            {result.actual_response && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">AI Response:</span>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{result.actual_response}</p>
                </div>
              </div>
            )}
            
            {result.error_message && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Error:</span>
                <div className="bg-error-50 rounded-md p-3">
                  <p className="text-sm text-error-800">{result.error_message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestForm 