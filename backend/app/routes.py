from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
from pydantic import BaseModel
import logging
from .models import (
    TestCase, TestResult, TestSuite, TestExecutionRequest, 
    TestExecutionResponse, TestReport, TestCategory
)
from .services.test_service import TestService
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize test service
test_service = TestService()

@router.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Agent Testing System API", "version": "1.0.0"}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-testing-system"}

@router.get("/test-categories")
async def get_test_categories():
    """Get available test categories"""
    return {
        "categories": [
            {
                "value": category.value,
                "name": category.name,
                "description": category.value.replace("_", " ").title()
            }
            for category in TestCategory
        ]
    }

@router.get("/predefined-test-cases")
async def get_predefined_test_cases():
    """Get predefined test cases for all categories"""
    try:
        cases = test_service.get_predefined_test_cases()
        return {"test_cases": cases}
    except Exception as e:
        logger.error(f"Error getting predefined test cases: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get predefined test cases")

@router.post("/execute-tests")
async def execute_tests(request: TestExecutionRequest):
    """Execute a test suite"""
    try:
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        if not request.test_cases:
            raise HTTPException(status_code=400, detail="At least one test case is required")
        
        logger.info(f"Executing {len(request.test_cases)} test cases")
        
        # Execute the test suite
        result = await test_service.execute_test_suite(request)
        
        return result
        
    except Exception as e:
        logger.error(f"Error executing tests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute tests: {str(e)}")

class QuickTestRequest(BaseModel):
    prompt: str
    web_page_url: str

@router.post("/quick-test")
async def quick_test(request: QuickTestRequest):
    """Run a quick single test"""
    try:
        if not request.web_page_url:
            raise HTTPException(status_code=400, detail="Web page URL is required")
        
        if not request.prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        result = await test_service.run_quick_test(request.prompt, request.web_page_url)
        return result
        
    except Exception as e:
        logger.error(f"Error running quick test: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to run quick test: {str(e)}")

@router.get("/executions")
async def get_all_executions():
    """Get all test executions"""
    try:
        executions = test_service.get_all_executions()
        return {"executions": executions}
    except Exception as e:
        logger.error(f"Error getting executions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get executions")

@router.get("/executions/{execution_id}")
async def get_execution(execution_id: str):
    """Get specific execution result"""
    try:
        execution = test_service.get_execution_result(execution_id)
        if not execution:
            raise HTTPException(status_code=404, detail="Execution not found")
        return execution
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting execution {execution_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get execution")

@router.get("/executions/{execution_id}/report")
async def get_execution_report(execution_id: str):
    """Get detailed test report for an execution"""
    try:
        report = test_service.generate_test_report(execution_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating report for {execution_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.post("/generate-test-suite")
async def generate_test_suite(
    categories: List[str],
    cases_per_category: int = 5
):
    """Generate a test suite with AI-generated test cases"""
    try:
        # Convert string categories to TestCategory enum
        test_categories = []
        for cat_str in categories:
            try:
                test_categories.append(TestCategory(cat_str))
            except ValueError:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid category: {cat_str}. Valid categories: {[c.value for c in TestCategory]}"
                )
        
        test_suite = await test_service.generate_test_suite(test_categories, cases_per_category)
        return test_suite
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating test suite: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate test suite")

@router.get("/stats")
async def get_system_stats():
    """Get system statistics"""
    try:
        executions = test_service.get_all_executions()
        
        total_executions = len(executions)
        total_tests = sum(exec.total_tests for exec in executions)
        total_passed = sum(exec.passed_tests for exec in executions)
        total_failed = sum(exec.failed_tests for exec in executions)
        
        avg_success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        avg_execution_time = sum(exec.execution_time for exec in executions) / total_executions if total_executions > 0 else 0
        
        return {
            "total_executions": total_executions,
            "total_tests": total_tests,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "average_success_rate": round(avg_success_rate, 2),
            "average_execution_time": round(avg_execution_time, 2),
            "system_status": "operational"
        }
        
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get system stats") 