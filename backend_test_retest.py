#!/usr/bin/env python3
"""
Backend API Re-Test Suite for Belajar Biar Pintar
Focus: Testing new exam logic with random sampling and question_ids parameter
"""
import requests
import json
from typing import Dict, Any, Optional, List

# Base URL from frontend/.env
BASE_URL = "https://test-builder-119.preview.emergentagent.com/api"

# Admin credentials
ADMIN_PASSWORD = "admin123"
EXPECTED_TOKEN = "bbp-admin-2026-secret-token"

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    if passed:
        test_results["passed"].append(f"✅ {name}")
        print(f"✅ PASS: {name}")
    else:
        test_results["failed"].append(f"❌ {name}: {details}")
        print(f"❌ FAIL: {name}")
        if details:
            print(f"   Details: {details}")

def log_warning(message: str):
    """Log warning"""
    test_results["warnings"].append(f"⚠️  {message}")
    print(f"⚠️  WARNING: {message}")

# ============================================================================
# TEST 1: GET /api/subjects - verify bankSize, examCount, totalQuestions
# ============================================================================

def test_subjects_with_new_fields():
    """Test 1: GET /api/subjects - verify each subject includes bankSize, examCount, totalQuestions"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/subjects - Verify new fields")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/subjects", timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/subjects returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test("GET /api/subjects returns 200", True)
        
        subjects = response.json()
        
        if not isinstance(subjects, list):
            log_test("Response is a list", False, f"Got type: {type(subjects)}")
            return None
        
        log_test("Response is a list", True)
        
        # Check all subjects have new fields
        kup_subject = None
        for subj in subjects:
            required_fields = ["id", "name", "bankSize", "examCount", "totalQuestions", "essayCount"]
            missing = [f for f in required_fields if f not in subj]
            
            if missing:
                log_test(f"Subject '{subj.get('name', 'unknown')}' has required fields", False, f"Missing: {missing}")
            else:
                print(f"   ✓ {subj['name']}: bankSize={subj['bankSize']}, examCount={subj['examCount']}, totalQuestions={subj['totalQuestions']}, essayCount={subj['essayCount']}")
            
            # Find KUP subject
            if "KUP" in subj.get("name", ""):
                kup_subject = subj
        
        log_test("All subjects include bankSize, examCount, totalQuestions, essayCount", True)
        
        # Verify KUP subject specifically
        if kup_subject:
            print(f"\n   📌 KUP Subject: {kup_subject['name']}")
            print(f"      bankSize: {kup_subject['bankSize']}")
            print(f"      examCount: {kup_subject['examCount']}")
            print(f"      totalQuestions: {kup_subject['totalQuestions']}")
            print(f"      essayCount: {kup_subject['essayCount']}")
            
            # Verify expected values
            if kup_subject['bankSize'] == 100:
                log_test("KUP bankSize = 100", True)
            else:
                log_test("KUP bankSize = 100", False, f"Got {kup_subject['bankSize']}")
            
            if kup_subject['examCount'] == 40:
                log_test("KUP examCount = 40", True)
            else:
                log_test("KUP examCount = 40", False, f"Got {kup_subject['examCount']}")
            
            if kup_subject['totalQuestions'] == 40:
                log_test("KUP totalQuestions = 40 (min(examCount, bankSize))", True)
            else:
                log_test("KUP totalQuestions = 40", False, f"Got {kup_subject['totalQuestions']}")
            
            if kup_subject['essayCount'] == 25:
                log_test("KUP essayCount = 25", True)
            else:
                log_test("KUP essayCount = 25", False, f"Got {kup_subject['essayCount']}")
        else:
            log_test("Found KUP subject", False, "KUP subject not found in subjects list")
        
        return subjects, kup_subject
    
    except Exception as e:
        log_test("GET /api/subjects", False, str(e))
        return None, None

# ============================================================================
# TEST 2: GET /api/subjects/{kup_id}/exam - verify random sampling
# ============================================================================

def test_kup_exam_sampling(kup_id: str):
    """Test 2: GET /api/subjects/{kup_id}/exam - verify exactly 40 questions, no answer/pembahasan, randomization"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/subjects/{kup_id}/exam - Random sampling")
    print("="*80)
    
    try:
        # First call
        response1 = requests.get(f"{BASE_URL}/subjects/{kup_id}/exam", timeout=10)
        
        if response1.status_code != 200:
            log_test("GET /api/subjects/{kup_id}/exam returns 200", False, f"Status: {response1.status_code}")
            return None
        
        log_test("GET /api/subjects/{kup_id}/exam returns 200", True)
        
        exam1 = response1.json()
        questions1 = exam1.get("questions", [])
        
        # Verify exactly 40 questions
        if len(questions1) == 40:
            log_test("Exam returns exactly 40 questions", True)
        else:
            log_test("Exam returns exactly 40 questions", False, f"Got {len(questions1)} questions")
        
        # Verify questions contain ONLY id, number, question, options
        leaked_fields = []
        for i, q in enumerate(questions1):
            if "answer" in q:
                leaked_fields.append(f"Question {i+1} contains 'answer' field")
            if "pembahasan" in q:
                leaked_fields.append(f"Question {i+1} contains 'pembahasan' field")
        
        if leaked_fields:
            log_test("Questions do NOT leak answer/pembahasan", False, "; ".join(leaked_fields[:3]))
        else:
            log_test("Questions do NOT leak answer/pembahasan ✓ CRITICAL", True)
        
        # Verify questions have required fields
        if questions1:
            sample_q = questions1[0]
            required_fields = ["id", "number", "question", "options"]
            missing = [f for f in required_fields if f not in sample_q]
            
            if missing:
                log_test("Questions have required fields (id, number, question, options)", False, f"Missing: {missing}")
            else:
                log_test("Questions have required fields (id, number, question, options)", True)
        
        # Second call to verify randomization
        print("\n   🔄 Calling exam endpoint again to verify randomization...")
        response2 = requests.get(f"{BASE_URL}/subjects/{kup_id}/exam", timeout=10)
        
        if response2.status_code != 200:
            log_test("Second exam call returns 200", False, f"Status: {response2.status_code}")
            return exam1
        
        log_test("Second exam call returns 200", True)
        
        exam2 = response2.json()
        questions2 = exam2.get("questions", [])
        
        # Verify second call also returns 40 questions
        if len(questions2) == 40:
            log_test("Second exam call also returns exactly 40 questions", True)
        else:
            log_test("Second exam call also returns exactly 40 questions", False, f"Got {len(questions2)} questions")
        
        # Compare question IDs to verify randomization
        ids1 = set(q["id"] for q in questions1)
        ids2 = set(q["id"] for q in questions2)
        
        if ids1 == ids2:
            log_test("Question sets are randomized (different between calls)", False, "Both calls returned identical question sets")
        else:
            overlap = len(ids1 & ids2)
            print(f"   Overlap: {overlap}/40 questions are the same")
            log_test("Question sets are randomized (different between calls)", True, f"Overlap: {overlap}/40")
        
        return exam1
    
    except Exception as e:
        log_test("GET /api/subjects/{kup_id}/exam", False, str(e))
        return None

# ============================================================================
# TEST 3: POST /api/exam/submit with question_ids
# ============================================================================

def test_submit_with_question_ids(kup_id: str):
    """Test 3: POST /api/exam/submit with question_ids parameter"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/exam/submit with question_ids")
    print("="*80)
    
    try:
        # First, get an exam to obtain question IDs
        response = requests.get(f"{BASE_URL}/subjects/{kup_id}/exam", timeout=10)
        
        if response.status_code != 200:
            log_test("GET exam for submit test", False, f"Status: {response.status_code}")
            return
        
        exam = response.json()
        questions = exam.get("questions", [])
        
        if len(questions) != 40:
            log_test("Got 40 questions for submit test", False, f"Got {len(questions)}")
            return
        
        log_test("Got 40 questions for submit test", True)
        
        # Extract question IDs in order
        question_ids = [q["id"] for q in questions]
        
        # Answer 10 questions (we don't know the correct answers, so we'll just submit "A")
        answers = {}
        for i in range(10):
            answers[question_ids[i]] = "A"
        
        # Submit with question_ids
        payload = {
            "subject_id": kup_id,
            "candidate": {
                "name": "Uji",
                "id": "BBP-TEST"
            },
            "answers": answers,
            "question_ids": question_ids
        }
        
        response = requests.post(f"{BASE_URL}/exam/submit", json=payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/exam/submit with question_ids returns 200", False, f"Status: {response.status_code}, Body: {response.text}")
            return
        
        log_test("POST /api/exam/submit with question_ids returns 200", True)
        
        result_data = response.json()
        result = result_data.get("result", {})
        review = result_data.get("review", [])
        
        # Verify result.total == 40 (NOT 100)
        total = result.get("total", 0)
        if total == 40:
            log_test("result.total = 40 (NOT 100)", True)
        else:
            log_test("result.total = 40 (NOT 100)", False, f"Got total={total}")
        
        # Verify counts
        correct = result.get("correct", 0)
        wrong = result.get("wrong", 0)
        unanswered = result.get("unanswered", 0)
        
        print(f"   Total: {total}, Correct: {correct}, Wrong: {wrong}, Unanswered: {unanswered}")
        
        # Verify unanswered = 40 - 10 = 30 (approximately, since we don't know which answers are correct)
        answered = correct + wrong
        if answered == 10:
            log_test("Answered count = 10 (as submitted)", True)
        else:
            log_test("Answered count = 10", False, f"Got {answered}")
        
        if unanswered == 30:
            log_test("Unanswered count = 30 (40 - 10)", True)
        else:
            log_test("Unanswered count = 30", False, f"Got {unanswered}")
        
        # Verify counts consistency
        if correct + wrong + unanswered == total:
            log_test("Counts are consistent (correct + wrong + unanswered = total)", True)
        else:
            log_test("Counts are consistent", False, f"{correct}+{wrong}+{unanswered} != {total}")
        
        # Verify score calculation
        score = result.get("score", 0)
        expected_score = round((correct / total) * 100, 2) if total > 0 else 0
        
        if abs(score - expected_score) < 0.01:
            log_test("Score = round(correct/40*100, 2)", True, f"Score: {score}")
        else:
            log_test("Score = round(correct/40*100, 2)", False, f"Expected {expected_score}, got {score}")
        
        # Verify passed logic
        passed = result.get("passed", False)
        expected_passed = score >= 60
        
        if passed == expected_passed:
            log_test("Passed = (score >= 60)", True, f"Score: {score}, Passed: {passed}")
        else:
            log_test("Passed = (score >= 60)", False, f"Score: {score}, Passed: {passed}, Expected: {expected_passed}")
        
        # Verify review has 40 items
        if len(review) == 40:
            log_test("Review has 40 items", True)
        else:
            log_test("Review has 40 items", False, f"Got {len(review)} items")
        
        # Verify review items have required fields
        if review:
            sample_review = review[0]
            required_fields = ["answer", "selected", "is_correct", "pembahasan"]
            missing = [f for f in required_fields if f not in sample_review]
            
            if missing:
                log_test("Review items have answer, selected, is_correct, pembahasan", False, f"Missing: {missing}")
            else:
                log_test("Review items have answer, selected, is_correct, pembahasan", True)
        
        # Verify review order matches question_ids
        review_ids = [r["id"] for r in review]
        if review_ids == question_ids:
            log_test("Review items are in same order as question_ids", True)
        else:
            log_test("Review items are in same order as question_ids", False, "Order mismatch")
        
        print(f"\n   📊 Result Summary:")
        print(f"      Total: {total}")
        print(f"      Correct: {correct}")
        print(f"      Wrong: {wrong}")
        print(f"      Unanswered: {unanswered}")
        print(f"      Score: {score}")
        print(f"      Passed: {passed}")
    
    except Exception as e:
        log_test("POST /api/exam/submit with question_ids", False, str(e))

# ============================================================================
# TEST 4: Backward compatibility - submit WITHOUT question_ids
# ============================================================================

def test_submit_without_question_ids(subjects: List[dict]):
    """Test 4: POST /api/exam/submit WITHOUT question_ids (backward compatibility)"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/exam/submit WITHOUT question_ids (backward compat)")
    print("="*80)
    
    try:
        # Find a small subject (PPh OP & SPT PPh OP with 5 questions)
        small_subject = None
        for subj in subjects:
            if "PPh OP" in subj.get("name", "") and subj.get("totalQuestions", 0) <= 10:
                small_subject = subj
                break
        
        if not small_subject:
            # Use any subject with small question count
            for subj in subjects:
                if subj.get("totalQuestions", 0) <= 10 and subj.get("totalQuestions", 0) > 0:
                    small_subject = subj
                    break
        
        if not small_subject:
            log_test("Found small subject for backward compat test", False, "No small subject found")
            return
        
        log_test("Found small subject for backward compat test", True, f"{small_subject['name']} ({small_subject['totalQuestions']} questions)")
        
        subject_id = small_subject["id"]
        expected_total = small_subject["totalQuestions"]
        
        # Submit without question_ids (should score against all questions)
        payload = {
            "subject_id": subject_id,
            "candidate": {
                "name": "Uji Backward",
                "id": "BBP-TEST-COMPAT"
            },
            "answers": {}  # No answers
        }
        
        response = requests.post(f"{BASE_URL}/exam/submit", json=payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/exam/submit without question_ids returns 200", False, f"Status: {response.status_code}")
            return
        
        log_test("POST /api/exam/submit without question_ids returns 200", True)
        
        result_data = response.json()
        result = result_data.get("result", {})
        
        # Verify total equals the subject's total questions
        total = result.get("total", 0)
        if total == expected_total:
            log_test(f"Backward compat: total = {expected_total} (all questions)", True)
        else:
            log_test(f"Backward compat: total = {expected_total}", False, f"Got total={total}")
        
        print(f"   Subject: {small_subject['name']}")
        print(f"   Total questions: {total}")
        print(f"   Score: {result.get('score', 0)}")
    
    except Exception as e:
        log_test("POST /api/exam/submit without question_ids", False, str(e))

# ============================================================================
# TEST 5: Quick regression tests
# ============================================================================

def test_kup_essays(kup_id: str):
    """Test 5a: GET /api/subjects/{kup_id}/essays returns 25 essays"""
    print("\n" + "="*80)
    print("TEST 5a: GET /api/subjects/{kup_id}/essays")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/subjects/{kup_id}/essays", timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/subjects/{kup_id}/essays returns 200", False, f"Status: {response.status_code}")
            return
        
        log_test("GET /api/subjects/{kup_id}/essays returns 200", True)
        
        essays = response.json()
        
        if len(essays) == 25:
            log_test("KUP essays count = 25", True)
        else:
            log_test("KUP essays count = 25", False, f"Got {len(essays)} essays")
        
        # Verify essays have question and model_answer
        if essays:
            sample = essays[0]
            if "question" in sample and "model_answer" in sample:
                log_test("Essays have question and model_answer", True)
            else:
                log_test("Essays have question and model_answer", False, f"Keys: {sample.keys()}")
    
    except Exception as e:
        log_test("GET /api/subjects/{kup_id}/essays", False, str(e))

def test_admin_login_and_questions(kup_id: str):
    """Test 5b: Admin login and GET /api/admin/questions with answer field"""
    print("\n" + "="*80)
    print("TEST 5b: Admin login and GET /api/admin/questions")
    print("="*80)
    
    try:
        # Login
        payload = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{BASE_URL}/admin/login", json=payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/login returns 200", False, f"Status: {response.status_code}")
            return
        
        log_test("POST /api/admin/login returns 200", True)
        
        data = response.json()
        token = data.get("token")
        
        if token != EXPECTED_TOKEN:
            log_test("Admin token is correct", False, f"Expected '{EXPECTED_TOKEN}', got '{token}'")
            return
        
        log_test("Admin token is correct", True)
        
        # Get questions with auth
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/questions?subject_id={kup_id}", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/admin/questions returns 200", False, f"Status: {response.status_code}")
            return
        
        log_test("GET /api/admin/questions returns 200", True)
        
        questions = response.json()
        
        if len(questions) == 100:
            log_test("KUP has 100 questions in admin view", True)
        else:
            log_test("KUP has 100 questions in admin view", False, f"Got {len(questions)} questions")
        
        # Verify questions include 'answer' field
        if questions:
            sample = questions[0]
            if "answer" in sample:
                log_test("Admin questions include 'answer' field", True)
            else:
                log_test("Admin questions include 'answer' field", False, f"Keys: {sample.keys()}")
    
    except Exception as e:
        log_test("Admin login and questions", False, str(e))

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def run_all_tests():
    """Run all backend API re-tests"""
    print("\n" + "="*80)
    print("BELAJAR BIAR PINTAR - BACKEND API RE-TEST SUITE")
    print("Focus: New exam logic with random sampling and question_ids")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    # Test 1: GET /api/subjects with new fields
    result = test_subjects_with_new_fields()
    if not result:
        print("\n❌ Cannot continue without subjects")
        print_summary()
        return
    
    subjects, kup_subject = result
    
    if not kup_subject:
        print("\n❌ Cannot continue without KUP subject")
        print_summary()
        return
    
    kup_id = kup_subject["id"]
    
    # Test 2: GET /api/subjects/{kup_id}/exam - random sampling
    test_kup_exam_sampling(kup_id)
    
    # Test 3: POST /api/exam/submit with question_ids
    test_submit_with_question_ids(kup_id)
    
    # Test 4: Backward compatibility
    test_submit_without_question_ids(subjects)
    
    # Test 5: Quick regression
    test_kup_essays(kup_id)
    test_admin_login_and_questions(kup_id)
    
    # Print summary
    print_summary()

def print_summary():
    """Print test summary"""
    print("\n\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total = len(test_results["passed"]) + len(test_results["failed"])
    passed = len(test_results["passed"])
    failed = len(test_results["failed"])
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if test_results["warnings"]:
        print(f"\nWarnings: {len(test_results['warnings'])}")
        for w in test_results["warnings"]:
            print(f"  {w}")
    
    if test_results["failed"]:
        print("\n" + "="*80)
        print("FAILED TESTS:")
        print("="*80)
        for f in test_results["failed"]:
            print(f"  {f}")
    
    print("\n" + "="*80)
    if failed == 0:
        print("✅ ALL TESTS PASSED!")
    else:
        print(f"❌ {failed} TEST(S) FAILED")
    print("="*80)

if __name__ == "__main__":
    run_all_tests()
