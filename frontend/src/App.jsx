import React, { useState } from 'react'
import TestInterface from './components/TestInterface'
import TestResults from './components/TestResults'
import TestForm from './components/TestForm'
import { FlaskConical, BarChart3, Settings as SettingsIcon, Home } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshResults, setRefreshResults] = useState(0)

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'test', name: 'Test Interface', icon: FlaskConical },
    { id: 'results', name: 'Results', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTestComplete={() => setRefreshResults(prev => prev + 1)} refreshResults={refreshResults} />
      case 'test':
        return <TestInterface onTestComplete={() => setRefreshResults(prev => prev + 1)} />
      case 'results':
        return <TestResults refreshTrigger={refreshResults} />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onTestComplete={() => setRefreshResults(prev => prev + 1)} refreshResults={refreshResults} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FlaskConical className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                AI Agent Testing System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  )
}

function Dashboard({ onTestComplete, refreshResults }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome to the AI Agent Testing System. Monitor your test executions and view results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Test</h3>
          <TestForm onTestComplete={onTestComplete} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
          <TestResults compact={true} refreshTrigger={refreshResults} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Backend Status</span>
              <span className="text-success-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">AI Model</span>
              <span className="text-gray-400">Qwen 2.5 72B (Free)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Test</span>
              <span className="text-gray-400">Never</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-gray-600">
          Configure your testing preferences and system settings.
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Web Page URL
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Timeout (seconds)
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="30"
              min="5"
              max="300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model (for advanced testing)
            </label>
            <select className="input-field">
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
          <button className="btn-primary">Save Configuration</button>
        </div>
      </div>
    </div>
  )
}

export default App 