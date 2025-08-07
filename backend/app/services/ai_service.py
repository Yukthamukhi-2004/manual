import asyncio
import time
from typing import List, Dict, Any, Optional
from openai import OpenAI
from ..models import TestCase, TestCategory, TestResult, TestStatus
from config import settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, api_key: str, model: str = "qwen/qwen-2.5-72b-instruct:free"):
        self.api_key = api_key
        self.model = model
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
    
    async def test_prompt(self, test_case: TestCase) -> TestResult:
        """Execute a single test case against the AI model"""
        start_time = time.time()
        
        try:
            # Prepare the prompt
            system_prompt = self._get_system_prompt(test_case.category)
            
            response = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://ai-agent-testing-system.com",  # Optional. Site URL for rankings on openrouter.ai.
                    "X-Title": "AI Agent Testing System",  # Optional. Site title for rankings on openrouter.ai.
                },
                extra_body={},
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": test_case.prompt}
                ]
            )
            
            actual_response = response.choices[0].message.content
            response_time = time.time() - start_time
            
            # Evaluate the response
            status, accuracy_score, error_message = self._evaluate_response(
                test_case, actual_response
            )
            
            return TestResult(
                test_case_id=test_case.id or "unknown",
                actual_response=actual_response,
                status=status,
                response_time=response_time,
                accuracy_score=accuracy_score,
                error_message=error_message,
                metadata={
                    "model": self.model,
                    "category": test_case.category.value,
                    "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None
                }
            )
            
        except Exception as e:
            logger.error(f"Error testing prompt: {str(e)}")
            return TestResult(
                test_case_id=test_case.id or "unknown",
                actual_response="",
                status=TestStatus.ERROR,
                response_time=time.time() - start_time,
                error_message=str(e),
                metadata={"model": self.model, "category": test_case.category.value}
            )
    
    def _get_system_prompt(self, category: TestCategory) -> str:
        """Get appropriate system prompt based on test category"""
        prompts = {
            TestCategory.PROMPT_UNDERSTANDING: "You are a helpful AI assistant. Respond naturally to user queries.",
            TestCategory.RESPONSE_ACCURACY: "You are a helpful AI assistant. Provide accurate and relevant information.",
            TestCategory.FALLBACK_HANDLING: "You are a helpful AI assistant. If you don't know something, say so politely.",
            TestCategory.TASK_EXECUTION: "You are a helpful AI assistant. Execute tasks as requested.",
            TestCategory.PERFORMANCE: "You are a helpful AI assistant. Provide concise and efficient responses."
        }
        return prompts.get(category, "You are a helpful AI assistant.")
    
    def _evaluate_response(self, test_case: TestCase, actual_response: str) -> tuple[TestStatus, Optional[float], Optional[str]]:
        """Evaluate the AI response against expected criteria"""
        try:
            # Basic evaluation logic
            if not actual_response.strip():
                return TestStatus.FAILED, 0.0, "Empty response"
            
            # Check if expected response pattern is provided
            if test_case.expected_response:
                if test_case.expected_response.lower() in actual_response.lower():
                    return TestStatus.PASSED, 1.0, None
                else:
                    return TestStatus.FAILED, 0.0, "Response doesn't match expected pattern"
            
            # For categories without specific expectations, use basic heuristics
            if test_case.category == TestCategory.FALLBACK_HANDLING:
                fallback_indicators = ["i don't know", "i'm not sure", "i can't", "i don't have", "unable to"]
                if any(indicator in actual_response.lower() for indicator in fallback_indicators):
                    return TestStatus.PASSED, 0.8, None
                else:
                    return TestStatus.FAILED, 0.3, "No fallback handling detected"
            
            # Default: consider it passed if we got a response
            return TestStatus.PASSED, 0.7, None
            
        except Exception as e:
            return TestStatus.ERROR, 0.0, f"Evaluation error: {str(e)}"
    
    async def generate_test_cases(self, category: TestCategory, count: int = 10) -> List[TestCase]:
        """Generate test cases using AI"""
        try:
            prompt = f"""
            Generate {count} test cases for AI agent testing in the category: {category.value}
            
            For each test case, provide:
            1. A realistic user prompt
            2. Expected response pattern (optional)
            3. Brief description of what we're testing
            
            Category-specific guidelines:
            - PROMPT_UNDERSTANDING: Test if AI understands various input formats
            - RESPONSE_ACCURACY: Test factual accuracy and relevance
            - FALLBACK_HANDLING: Test graceful handling of unknown queries
            - TASK_EXECUTION: Test ability to perform specific tasks
            - PERFORMANCE: Test response quality and efficiency
            
            Return as JSON array with format:
            [
                {{
                    "prompt": "user input",
                    "expected_response": "expected pattern (optional)",
                    "description": "what we're testing"
                }}
            ]
            """
            
            response = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://ai-agent-testing-system.com",
                    "X-Title": "AI Agent Testing System",
                },
                extra_body={},
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a test case generator for AI systems."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Parse the response and create test cases
            content = response.choices[0].message.content
            # Simple parsing - in production, use proper JSON parsing
            test_cases = []
            
            # For now, return some predefined test cases
            predefined_cases = self._get_predefined_test_cases(category, count)
            return predefined_cases
            
        except Exception as e:
            logger.error(f"Error generating test cases: {str(e)}")
            return self._get_predefined_test_cases(category, count)
    
    def _get_predefined_test_cases(self, category: TestCategory, count: int) -> List[TestCase]:
        """Get predefined test cases for each category"""
        cases = {
            TestCategory.PROMPT_UNDERSTANDING: [
                TestCase(
                    prompt="Hello, how are you?",
                    description="Basic greeting understanding",
                    category=category
                ),
                TestCase(
                    prompt="What's the weather like?",
                    description="Ambiguous query handling",
                    category=category
                ),
                TestCase(
                    prompt="Can you help me with my homework?",
                    description="Request for assistance",
                    category=category
                )
            ],
            TestCategory.RESPONSE_ACCURACY: [
                TestCase(
                    prompt="What is 2+2?",
                    expected_response="4",
                    description="Basic math accuracy",
                    category=category
                ),
                TestCase(
                    prompt="Who is the current president of the United States?",
                    description="Factual information accuracy",
                    category=category
                ),
                TestCase(
                    prompt="What is the capital of France?",
                    expected_response="Paris",
                    description="Geographic knowledge",
                    category=category
                )
            ],
            TestCategory.FALLBACK_HANDLING: [
                TestCase(
                    prompt="What is the meaning of life?",
                    description="Philosophical question handling",
                    category=category
                ),
                TestCase(
                    prompt="Tell me about the future",
                    description="Speculative question handling",
                    category=category
                ),
                TestCase(
                    prompt="What's the secret to eternal youth?",
                    description="Impossible question handling",
                    category=category
                )
            ],
            TestCategory.TASK_EXECUTION: [
                TestCase(
                    prompt="Write a short poem about cats",
                    description="Creative task execution",
                    category=category
                ),
                TestCase(
                    prompt="Explain quantum physics in simple terms",
                    description="Complex topic explanation",
                    category=category
                ),
                TestCase(
                    prompt="Give me a recipe for chocolate chip cookies",
                    description="Instruction provision",
                    category=category
                )
            ],
            TestCategory.PERFORMANCE: [
                TestCase(
                    prompt="Summarize the benefits of exercise",
                    description="Concise summarization",
                    category=category
                ),
                TestCase(
                    prompt="List 5 ways to save money",
                    description="Structured response generation",
                    category=category
                ),
                TestCase(
                    prompt="Explain photosynthesis in one sentence",
                    description="Brevity requirement",
                    category=category
                )
            ]
        }
        
        return cases.get(category, [])[:count] 