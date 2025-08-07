# AI Agent Manual Testing System

A comprehensive testing framework for AI agents with both frontend and backend components, designed to validate AI agent performance through manual and automated testing.

## 🏗️ Project Structure

```
Main/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── ai_service.py
│   │       └── test_service.py
│   ├── requirements.txt
│   └── config.py
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TestInterface.jsx
│   │   │   ├── TestResults.jsx
│   │   │   └── TestForm.jsx
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── styles.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API Key or OpenRouter API Key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=qwen/qwen-2.5-72b-instruct:free
   HOST=0.0.0.0
   PORT=8000
   LOG_LEVEL=INFO
   ```

5. **Start the backend server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## 🧪 Testing Features

### ✅ Basic Functionalities

1. **Prompt Understanding**
   - Test if AI understands various input formats
   - Validate response relevance to user queries
   - Check handling of ambiguous requests

2. **Response Accuracy**
   - Verify factual correctness
   - Test mathematical accuracy
   - Validate information retrieval

3. **Fallback Handling**
   - Test graceful handling of unknown queries
   - Verify appropriate error responses
   - Check for polite uncertainty expressions

4. **Task Execution**
   - Test creative task completion
   - Validate instruction following
   - Check complex problem solving

5. **Performance Testing**
   - Measure response times
   - Test response quality
   - Validate efficiency metrics

### 📥 Input Methods

- **Text Prompts**: Direct text input for testing
- **Predefined Test Cases**: Built-in test scenarios
- **Custom Test Suites**: User-defined test collections
- **Quick Tests**: Single prompt testing

### 🔄 Testing Procedure

1. **Open the AI agent interface** (web application)
2. **Configure API settings** (OpenAI API key, model selection)
3. **Add test cases** (manual or predefined)
4. **Execute tests** and observe results
5. **Analyze performance** through detailed reports
6. **Export results** for further analysis

### 📤 Expected Output

The system provides comprehensive test results including:
- ✅ Pass/Fail status for each test
- ⏱️ Response time measurements
- 📊 Accuracy scores (0-100%)
- 🔍 Detailed AI responses
- 📈 Performance metrics
- 📋 Category breakdowns

## 🎯 Test Categories

### 1. Prompt Understanding
- Basic greeting responses
- Ambiguous query handling
- Request interpretation accuracy

### 2. Response Accuracy
- Factual information verification
- Mathematical calculations
- Knowledge base accuracy

### 3. Fallback Handling
- Unknown query responses
- Error message appropriateness
- Graceful degradation

### 4. Task Execution
- Creative writing tasks
- Problem-solving abilities
- Instruction following

### 5. Performance
- Response time optimization
- Quality vs. speed balance
- Resource efficiency

## 🔧 Configuration

### AI Model Integration

#### OpenAI Integration
- **API Key**: Use your OpenAI API key (`sk-...`)
- **Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Base URL**: Uses OpenAI's official API

#### OpenRouter Integration
- **API Key**: Use your OpenRouter API key (`sk-or-...`)
- **Models**: Qwen 2.5 72B (Free), Claude 3.5 Sonnet, Llama 3.1 8B, Gemini Pro
- **Base URL**: Uses OpenRouter's API gateway
- **Features**: Access to multiple AI providers through a single API

### Backend Configuration
- **API Keys**: Configure OpenAI or OpenRouter API access
- **Models**: Select from OpenAI models (GPT-3.5, GPT-4, GPT-4 Turbo) or OpenRouter models (Qwen 2.5 72B, Claude 3.5 Sonnet, Llama 3.1 8B, Gemini Pro)
- **Timeouts**: Set test execution timeouts
- **Logging**: Configure log levels and outputs

### Frontend Configuration
- **API Endpoints**: Backend service URLs
- **UI Themes**: Customizable interface
- **Export Formats**: Results export options

## 📊 Results Analysis

### Metrics Tracked
- **Success Rate**: Percentage of passed tests
- **Response Time**: Average and individual test times
- **Accuracy Score**: Quality assessment (0-1 scale)
- **Category Performance**: Breakdown by test type
- **Error Analysis**: Detailed failure reasons

### Reporting Features
- **Real-time Results**: Live test execution monitoring
- **Historical Data**: Past test execution records
- **Performance Trends**: Time-series analysis
- **Export Capabilities**: CSV, JSON, PDF formats

## 🛠️ API Endpoints

### Core Endpoints
- `GET /api/v1/` - System information
- `GET /api/v1/health` - Health check
- `GET /api/v1/test-categories` - Available test categories
- `GET /api/v1/predefined-test-cases` - Built-in test cases

### Testing Endpoints
- `POST /api/v1/execute-tests` - Run test suite
- `POST /api/v1/quick-test` - Single test execution
- `POST /api/v1/generate-test-suite` - AI-generated test cases

### Results Endpoints
- `GET /api/v1/executions` - All test executions
- `GET /api/v1/executions/{id}` - Specific execution
- `GET /api/v1/executions/{id}/report` - Detailed report
- `GET /api/v1/stats` - System statistics

## 🚀 Usage Examples

### Quick Test
```bash
curl -X POST "http://localhost:8000/api/v1/quick-test" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2?",
    "api_key": "your-api-key",
    "model": "gpt-3.5-turbo"
  }'
```

### Test Suite Execution
```bash
curl -X POST "http://localhost:8000/api/v1/execute-tests" \
  -H "Content-Type: application/json" \
  -d '{
    "test_cases": [
      {
        "prompt": "Hello, how are you?",
        "category": "prompt_understanding",
        "description": "Basic greeting test"
      }
    ],
    "api_key": "your-api-key",
    "model": "gpt-3.5-turbo"
  }'
```

## 🔒 Security Considerations

- **API Key Protection**: Never expose API keys in client-side code
- **Input Validation**: All user inputs are validated
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Secure error messages without sensitive data

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend server is running on port 8000
   - Verify firewall settings
   - Check CORS configuration

2. **API Key Errors**
   - Ensure valid OpenAI API key
   - Check API key permissions
   - Verify account billing status

3. **Test Execution Failures**
   - Check internet connectivity
   - Verify API rate limits
   - Review test case validity

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=DEBUG` in the backend `.env` file.

## 📈 Performance Optimization

- **Concurrent Testing**: Parallel test execution
- **Caching**: Result caching for repeated tests
- **Batch Processing**: Efficient bulk test execution
- **Resource Management**: Optimal memory and CPU usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation at `/docs` when server is running

---

**Built with ❤️ for AI Agent Testing** 