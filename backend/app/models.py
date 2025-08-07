from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class TestStatus(str, Enum):
    PASSED = "passed"
    FAILED = "failed"
    PENDING = "pending"
    ERROR = "error"

class TestCategory(str, Enum):
    PROMPT_UNDERSTANDING = "prompt_understanding"
    RESPONSE_ACCURACY = "response_accuracy"
    FALLBACK_HANDLING = "fallback_handling"
    TASK_EXECUTION = "task_execution"
    PERFORMANCE = "performance"

class TestCase(BaseModel):
    id: Optional[str] = None
    prompt: str = Field(..., description="The input prompt to test")
    expected_response: Optional[str] = Field(None, description="Expected response pattern")
    category: TestCategory = Field(..., description="Test category")
    description: str = Field(..., description="Test description")
    timeout: int = Field(30, description="Test timeout in seconds")
    created_at: datetime = Field(default_factory=datetime.now)

class TestResult(BaseModel):
    id: Optional[str] = None
    test_case_id: str = Field(..., description="Reference to test case")
    actual_response: str = Field(..., description="Actual AI response")
    status: TestStatus = Field(..., description="Test result status")
    response_time: float = Field(..., description="Response time in seconds")
    accuracy_score: Optional[float] = Field(None, description="Accuracy score (0-1)")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.now)

class TestSuite(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Test suite name")
    description: str = Field(..., description="Test suite description")
    test_cases: List[TestCase] = Field(default_factory=list, description="List of test cases")
    created_at: datetime = Field(default_factory=datetime.now)

class TestExecutionRequest(BaseModel):
    test_suite_id: Optional[str] = None
    test_cases: List[TestCase] = Field(..., description="Test cases to execute")
    api_key: str = Field(..., description="AI API key")
    model: str = Field("gpt-3.5-turbo", description="AI model to use")

class TestExecutionResponse(BaseModel):
    execution_id: str = Field(..., description="Unique execution ID")
    total_tests: int = Field(..., description="Total number of tests")
    passed_tests: int = Field(..., description="Number of passed tests")
    failed_tests: int = Field(..., description="Number of failed tests")
    results: List[TestResult] = Field(..., description="Test results")
    execution_time: float = Field(..., description="Total execution time")
    summary: Dict[str, Any] = Field(..., description="Execution summary")

class TestReport(BaseModel):
    execution_id: str = Field(..., description="Execution ID")
    test_suite_name: str = Field(..., description="Test suite name")
    execution_date: datetime = Field(..., description="Execution date")
    total_tests: int = Field(..., description="Total tests")
    passed_tests: int = Field(..., description="Passed tests")
    failed_tests: int = Field(..., description="Failed tests")
    success_rate: float = Field(..., description="Success rate percentage")
    average_response_time: float = Field(..., description="Average response time")
    category_breakdown: Dict[str, int] = Field(..., description="Results by category")
    detailed_results: List[TestResult] = Field(..., description="Detailed results") 