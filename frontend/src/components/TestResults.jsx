import React, { useState, useEffect } from 'react'
import { BarChart3, Download, RefreshCw, Eye, EyeOff } from 'lucide-react'

const TestResults = ({ compact = false, refreshTrigger = 0 }) => {
  const [executions, setExecutions] = useState([])
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState({})

  useEffect(() => {
    fetchExecutions()
  }, [refreshTrigger])

  const fetchExecutions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/executions')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setExecutions(data.executions || [])
    } catch (err) {
      setError('Failed to fetch test executions')
      console.error('Error fetching executions:', err)
    } finally {
      setIsLoading(false)
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

  const getSuccessRate = (execution) => {
    if (execution.total_tests === 0) return 0
    return (execution.passed_tests / execution.total_tests) * 100
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const toggleDetails = (executionId) => {
    setShowDetails(prev => ({
      ...prev,
      [executionId]: !prev[executionId]
    }))
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {executions.slice(0, 3).map((execution) => (
          <div key={execution.execution_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                getSuccessRate(execution) >= 80 ? 'bg-success-500' : 
                getSuccessRate(execution) >= 50 ? 'bg-yellow-500' : 'bg-error-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {execution.total_tests} tests
                </p>
                <p className="text-xs text-gray-500">
                  {execution.passed_tests} passed • {execution.execution_time.toFixed(2)}s
                </p>
              </div>
            </div>
            <span className={`status-badge ${getStatusClass(getSuccessRate(execution) >= 80 ? 'passed' : 'failed')}`}>
              {getSuccessRate(execution).toFixed(0)}%
            </span>
          </div>
        ))}
        {executions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No test executions yet</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
          <p className="mt-1 text-gray-600">
            View and analyze test execution results and performance metrics.
          </p>
        </div>
        <button
          onClick={fetchExecutions}
          disabled={isLoading}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error-800">Error</h3>
              <div className="mt-2 text-sm text-error-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading test results...</p>
        </div>
      ) : executions.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Results</h3>
          <p className="text-gray-600">Run some tests to see results here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {executions.map((execution) => (
            <div key={execution.execution_id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Test Execution {execution.execution_id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {execution.total_tests} tests • {execution.execution_time.toFixed(2)}s
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {execution.passed_tests}/{execution.total_tests} passed
                    </p>
                    <p className="text-sm text-gray-600">
                      {getSuccessRate(execution).toFixed(1)}% success rate
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleDetails(execution.execution_id)}
                    className="btn-secondary"
                  >
                    {showDetails[execution.execution_id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-success-600">{execution.passed_tests}</p>
                  <p className="text-sm text-gray-600">Passed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-error-600">{execution.failed_tests}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{execution.total_tests}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{execution.execution_time.toFixed(1)}s</p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
              </div>

              {/* Category Breakdown */}
              {execution.summary?.category_breakdown && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Category Breakdown</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(execution.summary.category_breakdown).map(([category, count]) => (
                      <span key={category} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                        {category}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              {showDetails[execution.execution_id] && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Results</h4>
                  <div className="space-y-3">
                    {execution.results.map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Test {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`status-badge ${getStatusClass(result.status)}`}>
                              {result.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {result.response_time.toFixed(2)}s
                            </span>
                          </div>
                        </div>
                        
                        {result.accuracy_score !== null && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600">Accuracy: </span>
                            <span className="text-xs font-medium">
                              {(result.accuracy_score * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-600">
                          <p className="font-medium">Response:</p>
                          <p className="mt-1 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                            {result.actual_response || 'No response'}
                          </p>
                        </div>
                        
                        {result.error_message && (
                          <div className="mt-2 text-xs">
                            <p className="font-medium text-error-600">Error:</p>
                            <p className="text-error-600">{result.error_message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestResults 