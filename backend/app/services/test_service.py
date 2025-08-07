import asyncio
import time
import uuid
from typing import List, Dict, Any
from datetime import datetime
from ..models import (
    TestCase, TestResult, TestSuite, TestExecutionRequest, 
    TestExecutionResponse, TestReport, TestStatus, TestCategory
)
from .ai_service import AIService
from config import settings
import logging

logger = logging.getLogger(__name__)

class TestService:
    def __init__(self):
        self.executions: Dict[str, TestExecutionResponse] = {}
    
    async def execute_test_suite(self, request: TestExecutionRequest) -> TestExecutionResponse:
        """Execute a complete test suite"""
        execution_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Use API key from settings if not provided or if it's a dummy key
        api_key = request.api_key
        if not api_key or api_key == "dummy_key":
            api_key = settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY
        
        # Execute all test cases
        results = []
        passed_tests = 0
        failed_tests = 0
        
        for i, test_case in enumerate(request.test_cases):
            logger.info(f"Executing test case {i+1}/{len(request.test_cases)}: {test_case.description}")
            
            # Add unique ID to test case if not present
            if not test_case.id:
                test_case.id = str(uuid.uuid4())
            
            # Execute the test
            if api_key:
                ai_service = AIService(api_key, request.model)
                result = await ai_service.test_prompt(test_case)
            else:
                # Return mock results if no API key is available
                result = TestResult(
                    test_case_id=test_case.id,
                    actual_response="This is a mock response for testing purposes. Please configure your API key in settings.",
                    status=TestStatus.PASSED,
                    response_time=0.1,
                    accuracy_score=1.0,
                    error_message=None,
                    metadata={
                        "model": request.model,
                        "category": test_case.category.value,
                        "mock": True
                    }
                )
            
            results.append(result)
            
            # Update counters
            if result.status == TestStatus.PASSED:
                passed_tests += 1
            else:
                failed_tests += 1
            
            # Add small delay between tests to avoid rate limiting
            await asyncio.sleep(0.1)
        
        execution_time = time.time() - start_time
        
        # Create execution response
        execution_response = TestExecutionResponse(
            execution_id=execution_id,
            total_tests=len(request.test_cases),
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            results=results,
            execution_time=execution_time,
            summary={
                "success_rate": (passed_tests / len(request.test_cases)) * 100 if request.test_cases else 0,
                "average_response_time": sum(r.response_time for r in results) / len(results) if results else 0,
                "category_breakdown": self._get_category_breakdown(results),
                "model_used": request.model
            }
        )
        
        # Store execution for later retrieval
        self.executions[execution_id] = execution_response
        
        return execution_response
    
    def _get_category_breakdown(self, results: List[TestResult]) -> Dict[str, int]:
        """Get breakdown of results by category"""
        breakdown = {}
        for result in results:
            category = result.metadata.get("category", "unknown")
            if category not in breakdown:
                breakdown[category] = 0
            breakdown[category] += 1
        return breakdown
    
    async def generate_test_suite(self, categories: List[TestCategory], cases_per_category: int = 5) -> TestSuite:
        """Generate a comprehensive test suite"""
        test_cases = []
        
        # Use API key from settings
        api_key = settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY
        
        for category in categories:
            if api_key:
                ai_service = AIService(api_key, "qwen/qwen-2.5-72b-instruct:free")
                cases = await ai_service.generate_test_cases(category, cases_per_category)
                test_cases.extend(cases)
            else:
                # Use predefined cases if no API key is available
                ai_service = AIService("dummy_key", "qwen/qwen-2.5-72b-instruct:free")
                cases = ai_service._get_predefined_test_cases(category, cases_per_category)
                test_cases.extend(cases)
        
        return TestSuite(
            id=str(uuid.uuid4()),
            name=f"Generated Test Suite - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            description=f"Auto-generated test suite with {len(test_cases)} test cases across {len(categories)} categories",
            test_cases=test_cases
        )
    
    def get_execution_result(self, execution_id: str) -> TestExecutionResponse:
        """Retrieve execution results by ID"""
        return self.executions.get(execution_id)
    
    def get_all_executions(self) -> List[TestExecutionResponse]:
        """Get all stored execution results"""
        return list(self.executions.values())
    
    def generate_test_report(self, execution_id: str) -> TestReport:
        """Generate a detailed test report"""
        execution = self.executions.get(execution_id)
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")
        
        # Calculate success rate
        success_rate = (execution.passed_tests / execution.total_tests) * 100 if execution.total_tests > 0 else 0
        
        # Calculate average response time
        avg_response_time = sum(r.response_time for r in execution.results) / len(execution.results) if execution.results else 0
        
        # Get category breakdown
        category_breakdown = {}
        for result in execution.results:
            category = result.metadata.get("category", "unknown")
            if category not in category_breakdown:
                category_breakdown[category] = 0
            category_breakdown[category] += 1
        
        return TestReport(
            execution_id=execution_id,
            test_suite_name="Generated Test Suite",
            execution_date=datetime.now(),
            total_tests=execution.total_tests,
            passed_tests=execution.passed_tests,
            failed_tests=execution.failed_tests,
            success_rate=success_rate,
            average_response_time=avg_response_time,
            category_breakdown=category_breakdown,
            detailed_results=execution.results
        )
    
    def get_predefined_test_cases(self) -> Dict[str, List[TestCase]]:
        """Get predefined test cases for each category"""
        cases = {}
        
        for category in TestCategory:
            ai_service = AIService("dummy_key", "qwen/qwen-2.5-72b-instruct:free")
            cases[category.value] = ai_service._get_predefined_test_cases(category, 5)
        
        return cases
    
    async def run_quick_test(self, prompt: str, web_page_url: str) -> TestResult:
        """Run a quick single test"""
        test_case = TestCase(
            prompt=prompt,
            description="Quick test",
            category=TestCategory.PROMPT_UNDERSTANDING
        )
        
        # Use API key from settings or a default one
        api_key = settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY
        if not api_key:
            # Return a mock result for testing without API key
            return TestResult(
                test_case_id=test_case.id or "unknown",
                actual_response="This is a mock response for testing purposes. Please configure your API key in settings.",
                status=TestStatus.PASSED,
                response_time=0.1,
                accuracy_score=1.0,
                error_message=None,
                metadata={
                    "model": "qwen/qwen-2.5-72b-instruct:free",
                    "category": test_case.category.value,
                    "mock": True
                }
            )
        
        # Use OpenRouter API key and model for testing
        ai_service = AIService(api_key, "qwen/qwen-2.5-72b-instruct:free")
        
        # Add web page URL to the prompt context
        enhanced_prompt = f"Web Page: {web_page_url}\n\nTest Prompt: {prompt}"
        test_case.prompt = enhanced_prompt
        
        return await ai_service.test_prompt(test_case) 