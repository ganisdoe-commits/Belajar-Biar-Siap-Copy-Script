#!/usr/bin/env python3
"""
Backend API Test Suite for Belajar Biar Pintar
Tests all public and admin endpoints
"""
import requests
import json
from typing import Dict, Any, Optional

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
# PUBLIC ENDPOINTS TESTS
# ============================================================================

def test_get_subjects():
    """Test 1: GET /api/subjects - should return 6 subjects with totalQuestions and essayCount"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/subjects")
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
        
        if len(subjects) != 6:
            log_warning(f"Expected 6 subjects, got {len(subjects)}")
        else:
            log_test("Returns 6 subjects", True)
        
        # Check first subject has required fields
        if subjects:
            subj = subjects[0]
            required_fields = ["id", "name", "totalQuestions", "essayCount"]
            missing = [f for f in required_fields if f not in subj]
            
            if missing:
                log_test("Subjects have required fields", False, f"Missing: {missing}")
            else:
                log_test("Subjects have required fields (id, name, totalQuestions, essayCount)", True)
                print(f"   Sample: {subj['name']} - {subj['totalQuestions']} questions, {subj['essayCount']} essays")
        
        return subjects
    
    except Exception as e:
        log_test("GET /api/subjects", False, str(e))
        return None

def test_get_subject_detail(subject_id: str):
    """Test 2: GET /api/subjects/{id} - fetch one subject"""
    print("\n" + "="*80)
    print(f"TEST 2: GET /api/subjects/{subject_id}")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/subjects/{subject_id}", timeout=10)
        
        if response.status_code != 200:
            log_test(f"GET /api/subjects/{subject_id} returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test(f"GET /api/subjects/{subject_id} returns 200", True)
        
        subject = response.json()
        
        required_fields = ["id", "name", "totalQuestions", "essayCount"]
        missing = [f for f in required_fields if f not in subject]
        
        if missing:
            log_test("Subject has required fields", False, f"Missing: {missing}")
        else:
            log_test("Subject has required fields", True)
        
        return subject
    
    except Exception as e:
        log_test(f"GET /api/subjects/{subject_id}", False, str(e))
        return None

def test_get_subject_invalid():
    """Test 2b: GET /api/subjects/{invalid_id} - should return 404"""
    print("\n" + "="*80)
    print("TEST 2b: GET /api/subjects/invalid-id-12345")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/subjects/invalid-id-12345", timeout=10)
        
        if response.status_code == 404:
            log_test("GET /api/subjects/{invalid_id} returns 404", True)
        else:
            log_test("GET /api/subjects/{invalid_id} returns 404", False, f"Got status: {response.status_code}")
    
    except Exception as e:
        log_test("GET /api/subjects/{invalid_id}", False, str(e))

def test_get_exam(subject_id: str):
    """Test 3: GET /api/subjects/{id}/exam - CRITICAL: must NOT include answer/pembahasan"""
    print("\n" + "="*80)
    print(f"TEST 3: GET /api/subjects/{subject_id}/exam")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/subjects/{subject_id}/exam", timeout=10)
        
        if response.status_code != 200:
            log_test(f"GET /api/subjects/{subject_id}/exam returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test(f"GET /api/subjects/{subject_id}/exam returns 200", True)
        
        exam = response.json()
        
        # Check structure
        required_fields = ["subject", "duration_sec", "questions"]
        missing = [f for f in required_fields if f not in exam]
        
        if missing:
            log_test("Exam has required fields", False, f"Missing: {missing}")
            return None
        
        log_test("Exam has required fields (subject, duration_sec, questions)", True)
        
        questions = exam.get("questions", [])
        
        if not questions:
            log_warning("No questions in exam")
            return exam
        
        # CRITICAL CHECK: Questions must NOT contain answer or pembahasan
        leaked_fields = []
        for i, q in enumerate(questions):
            if "answer" in q:
                leaked_fields.append(f"Question {i+1} contains 'answer' field")
            if "pembahasan" in q:
                leaked_fields.append(f"Question {i+1} contains 'pembahasan' field")
        
        if leaked_fields:
            log_test("Questions do NOT leak answer/pembahasan", False, "; ".join(leaked_fields))
        else:
            log_test("Questions do NOT leak answer/pembahasan ✓ CRITICAL", True)
        
        # Check questions have required fields only
        sample_q = questions[0]
        required_q_fields = ["id", "number", "question", "options"]
        missing_q = [f for f in required_q_fields if f not in sample_q]
        
        if missing_q:
            log_test("Questions have required fields", False, f"Missing: {missing_q}")
        else:
            log_test("Questions have required fields (id, number, question, options)", True)
            print(f"   Total questions: {len(questions)}")
        
        return exam
    
    except Exception as e:
        log_test(f"GET /api/subjects/{subject_id}/exam", False, str(e))
        return None

def test_submit_exam(subject_id: str, exam_data: dict):
    """Test 4: POST /api/exam/submit - server-side scoring"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/exam/submit")
    print("="*80)
    
    try:
        questions = exam_data.get("questions", [])
        
        if not questions:
            log_test("POST /api/exam/submit", False, "No questions to submit")
            return None
        
        # Create answers - answer first 3 correctly (we'll need to get actual answers from admin endpoint later)
        # For now, submit some answers
        answers = {}
        for i, q in enumerate(questions[:3]):
            # Submit answer "A" for first 3 questions
            answers[q["id"]] = "A"
        
        payload = {
            "subject_id": subject_id,
            "candidate": {
                "name": "Ahmad Tester",
                "id": "BBP-TEST-001"
            },
            "answers": answers
        }
        
        response = requests.post(f"{BASE_URL}/exam/submit", json=payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/exam/submit returns 200", False, f"Status: {response.status_code}, Body: {response.text}")
            return None
        
        log_test("POST /api/exam/submit returns 200", True)
        
        result_data = response.json()
        
        # Check structure
        if "result" not in result_data or "review" not in result_data:
            log_test("Response has result and review", False, f"Keys: {result_data.keys()}")
            return None
        
        log_test("Response has result and review", True)
        
        result = result_data["result"]
        review = result_data["review"]
        
        # Check result fields
        required_result_fields = ["score", "passed", "total", "correct", "wrong", "unanswered"]
        missing_result = [f for f in required_result_fields if f not in result]
        
        if missing_result:
            log_test("Result has required fields", False, f"Missing: {missing_result}")
        else:
            log_test("Result has required fields", True)
        
        # Verify scoring logic
        total = result.get("total", 0)
        correct = result.get("correct", 0)
        wrong = result.get("wrong", 0)
        unanswered = result.get("unanswered", 0)
        score = result.get("score", 0)
        passed = result.get("passed", False)
        
        print(f"   Total: {total}, Correct: {correct}, Wrong: {wrong}, Unanswered: {unanswered}")
        print(f"   Score: {score}, Passed: {passed}")
        
        # Verify score calculation
        expected_score = round((correct / total) * 100, 2) if total > 0 else 0
        if abs(score - expected_score) > 0.01:
            log_test("Score calculation correct", False, f"Expected {expected_score}, got {score}")
        else:
            log_test("Score calculation correct (correct/total*100)", True)
        
        # Verify passed logic
        expected_passed = score >= 60
        if passed != expected_passed:
            log_test("Passed logic correct (>=60)", False, f"Score {score}, passed={passed}")
        else:
            log_test("Passed logic correct (>=60)", True)
        
        # Verify counts consistency
        if correct + wrong + unanswered != total:
            log_test("Counts are consistent", False, f"{correct}+{wrong}+{unanswered} != {total}")
        else:
            log_test("Counts are consistent", True)
        
        # Check review items
        if not review:
            log_warning("Review is empty")
        else:
            sample_review = review[0]
            required_review_fields = ["answer", "selected", "is_correct", "pembahasan"]
            missing_review = [f for f in required_review_fields if f not in sample_review]
            
            if missing_review:
                log_test("Review items have required fields", False, f"Missing: {missing_review}")
            else:
                log_test("Review items have answer, selected, is_correct, pembahasan", True)
        
        return result_data
    
    except Exception as e:
        log_test("POST /api/exam/submit", False, str(e))
        return None

def test_get_essays(subject_id: str):
    """Test 5: GET /api/subjects/{id}/essays"""
    print("\n" + "="*80)
    print(f"TEST 5: GET /api/subjects/{subject_id}/essays")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/subjects/{subject_id}/essays", timeout=10)
        
        if response.status_code != 200:
            log_test(f"GET /api/subjects/{subject_id}/essays returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test(f"GET /api/subjects/{subject_id}/essays returns 200", True)
        
        essays = response.json()
        
        if not isinstance(essays, list):
            log_test("Response is a list", False, f"Got type: {type(essays)}")
            return None
        
        log_test("Response is a list", True)
        
        if essays:
            sample = essays[0]
            if "model_answer" not in sample:
                log_test("Essays include model_answer", False, f"Keys: {sample.keys()}")
            else:
                log_test("Essays include model_answer", True)
                print(f"   Total essays: {len(essays)}")
        
        return essays
    
    except Exception as e:
        log_test(f"GET /api/subjects/{subject_id}/essays", False, str(e))
        return None

def test_get_results_by_candidate(candidate_id: str):
    """Test 6: GET /api/results/{candidate_id}"""
    print("\n" + "="*80)
    print(f"TEST 6: GET /api/results/{candidate_id}")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/results/{candidate_id}", timeout=10)
        
        if response.status_code != 200:
            log_test(f"GET /api/results/{candidate_id} returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test(f"GET /api/results/{candidate_id} returns 200", True)
        
        results = response.json()
        
        if not isinstance(results, list):
            log_test("Response is a list", False, f"Got type: {type(results)}")
            return None
        
        log_test("Response is a list", True)
        
        if not results:
            log_warning("No results found for candidate")
        else:
            log_test(f"Found {len(results)} result(s) for candidate", True)
            print(f"   Results: {len(results)}")
        
        return results
    
    except Exception as e:
        log_test(f"GET /api/results/{candidate_id}", False, str(e))
        return None

# ============================================================================
# ADMIN ENDPOINTS TESTS
# ============================================================================

def test_admin_login_correct():
    """Test 7: POST /api/admin/login with correct password"""
    print("\n" + "="*80)
    print("TEST 7: POST /api/admin/login (correct password)")
    print("="*80)
    
    try:
        payload = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{BASE_URL}/admin/login", json=payload, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/login (correct) returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test("POST /api/admin/login (correct) returns 200", True)
        
        data = response.json()
        
        if "token" not in data:
            log_test("Response contains token", False, f"Keys: {data.keys()}")
            return None
        
        log_test("Response contains token", True)
        
        token = data["token"]
        
        if token != EXPECTED_TOKEN:
            log_test(f"Token is correct", False, f"Expected '{EXPECTED_TOKEN}', got '{token}'")
        else:
            log_test(f"Token is '{EXPECTED_TOKEN}'", True)
        
        return token
    
    except Exception as e:
        log_test("POST /api/admin/login (correct)", False, str(e))
        return None

def test_admin_login_wrong():
    """Test 7b: POST /api/admin/login with wrong password"""
    print("\n" + "="*80)
    print("TEST 7b: POST /api/admin/login (wrong password)")
    print("="*80)
    
    try:
        payload = {"password": "wrongpassword123"}
        response = requests.post(f"{BASE_URL}/admin/login", json=payload, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/admin/login (wrong) returns 401", True)
        else:
            log_test("POST /api/admin/login (wrong) returns 401", False, f"Got status: {response.status_code}")
    
    except Exception as e:
        log_test("POST /api/admin/login (wrong)", False, str(e))

def test_admin_endpoint_without_auth(subject_id: str):
    """Test 8a: Admin endpoint without auth returns 401"""
    print("\n" + "="*80)
    print("TEST 8a: GET /api/admin/questions without auth")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/admin/questions?subject_id={subject_id}", timeout=10)
        
        if response.status_code == 401:
            log_test("GET /api/admin/questions (no auth) returns 401", True)
        else:
            log_test("GET /api/admin/questions (no auth) returns 401", False, f"Got status: {response.status_code}")
    
    except Exception as e:
        log_test("GET /api/admin/questions (no auth)", False, str(e))

def test_admin_endpoint_with_auth(subject_id: str, token: str):
    """Test 8b: Admin endpoint with auth returns 200 and includes answer field"""
    print("\n" + "="*80)
    print("TEST 8b: GET /api/admin/questions with auth")
    print("="*80)
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/questions?subject_id={subject_id}", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/admin/questions (with auth) returns 200", False, f"Status: {response.status_code}")
            return None
        
        log_test("GET /api/admin/questions (with auth) returns 200", True)
        
        questions = response.json()
        
        if not isinstance(questions, list):
            log_test("Response is a list", False, f"Got type: {type(questions)}")
            return None
        
        log_test("Response is a list", True)
        
        if questions:
            sample = questions[0]
            if "answer" not in sample:
                log_test("Admin questions include 'answer' field", False, f"Keys: {sample.keys()}")
            else:
                log_test("Admin questions include 'answer' field", True)
                print(f"   Total questions: {len(questions)}")
        
        return questions
    
    except Exception as e:
        log_test("GET /api/admin/questions (with auth)", False, str(e))
        return None

def test_admin_crud_questions(subject_id: str, token: str):
    """Test 9: Admin CRUD for questions"""
    print("\n" + "="*80)
    print("TEST 9: Admin CRUD - Questions")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # CREATE
    try:
        payload = {
            "subject_id": subject_id,
            "question": "Apa singkatan dari NPWP?",
            "options": [
                {"key": "A", "text": "Nomor Pokok Wajib Pajak"},
                {"key": "B", "text": "Nomor Pribadi Wajib Pajak"},
                {"key": "C", "text": "Nomor Pokok Warga Pajak"},
                {"key": "D", "text": "Nomor Pribadi Warga Pajak"}
            ],
            "answer": "A",
            "pembahasan": "NPWP adalah Nomor Pokok Wajib Pajak"
        }
        
        response = requests.post(f"{BASE_URL}/admin/questions", json=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/questions (create)", False, f"Status: {response.status_code}, Body: {response.text}")
            return
        
        log_test("POST /api/admin/questions (create)", True)
        
        created = response.json()
        question_id = created.get("id")
        
        if not question_id:
            log_test("Created question has id", False, "No id in response")
            return
        
        log_test("Created question has id", True)
        print(f"   Created question ID: {question_id}")
        
        # UPDATE
        update_payload = {
            "subject_id": subject_id,
            "question": "Apa singkatan dari NPWP? (Updated)",
            "options": [
                {"key": "A", "text": "Nomor Pokok Wajib Pajak"},
                {"key": "B", "text": "Nomor Pribadi Wajib Pajak"},
                {"key": "C", "text": "Nomor Pokok Warga Pajak"},
                {"key": "D", "text": "Nomor Pribadi Warga Pajak"}
            ],
            "answer": "A",
            "pembahasan": "NPWP adalah Nomor Pokok Wajib Pajak (updated)"
        }
        
        response = requests.put(f"{BASE_URL}/admin/questions/{question_id}", json=update_payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("PUT /api/admin/questions/{id} (update)", False, f"Status: {response.status_code}")
        else:
            log_test("PUT /api/admin/questions/{id} (update)", True)
            updated = response.json()
            if "(Updated)" in updated.get("question", ""):
                log_test("Question was updated", True)
            else:
                log_test("Question was updated", False, "Question text not updated")
        
        # DELETE
        response = requests.delete(f"{BASE_URL}/admin/questions/{question_id}", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("DELETE /api/admin/questions/{id}", False, f"Status: {response.status_code}")
        else:
            log_test("DELETE /api/admin/questions/{id}", True)
    
    except Exception as e:
        log_test("Admin CRUD - Questions", False, str(e))

def test_admin_crud_essays(subject_id: str, token: str):
    """Test 9b: Admin CRUD for essays"""
    print("\n" + "="*80)
    print("TEST 9b: Admin CRUD - Essays")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # CREATE
    try:
        payload = {
            "subject_id": subject_id,
            "question": "Jelaskan perbedaan antara pajak langsung dan tidak langsung",
            "model_answer": "Pajak langsung dikenakan langsung kepada wajib pajak (contoh: PPh), sedangkan pajak tidak langsung dikenakan melalui kegiatan/transaksi (contoh: PPN)"
        }
        
        response = requests.post(f"{BASE_URL}/admin/essays", json=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/essays (create)", False, f"Status: {response.status_code}")
            return
        
        log_test("POST /api/admin/essays (create)", True)
        
        created = response.json()
        essay_id = created.get("id")
        
        if not essay_id:
            log_test("Created essay has id", False, "No id in response")
            return
        
        log_test("Created essay has id", True)
        print(f"   Created essay ID: {essay_id}")
        
        # UPDATE
        update_payload = {
            "subject_id": subject_id,
            "question": "Jelaskan perbedaan antara pajak langsung dan tidak langsung (Updated)",
            "model_answer": "Updated answer"
        }
        
        response = requests.put(f"{BASE_URL}/admin/essays/{essay_id}", json=update_payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("PUT /api/admin/essays/{id} (update)", False, f"Status: {response.status_code}")
        else:
            log_test("PUT /api/admin/essays/{id} (update)", True)
        
        # DELETE
        response = requests.delete(f"{BASE_URL}/admin/essays/{essay_id}", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("DELETE /api/admin/essays/{id}", False, f"Status: {response.status_code}")
        else:
            log_test("DELETE /api/admin/essays/{id}", True)
    
    except Exception as e:
        log_test("Admin CRUD - Essays", False, str(e))

def test_admin_bulk_questions(subject_id: str, token: str):
    """Test 10: POST /api/admin/questions/bulk"""
    print("\n" + "="*80)
    print("TEST 10: POST /api/admin/questions/bulk")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        payload = {
            "subject_id": subject_id,
            "items": [
                {
                    "question": "Bulk Question 1: Berapa tarif PPN di Indonesia?",
                    "options": [
                        {"key": "A", "text": "10%"},
                        {"key": "B", "text": "11%"},
                        {"key": "C", "text": "12%"},
                        {"key": "D", "text": "15%"}
                    ],
                    "answer": "B",
                    "pembahasan": "Tarif PPN di Indonesia adalah 11%"
                },
                {
                    "question": "Bulk Question 2: Apa kepanjangan dari PKP?",
                    "options": [
                        {"key": "A", "text": "Pengusaha Kena Pajak"},
                        {"key": "B", "text": "Pengusaha Kecil Pajak"},
                        {"key": "C", "text": "Perusahaan Kena Pajak"},
                        {"key": "D", "text": "Perusahaan Kecil Pajak"}
                    ],
                    "answer": "A",
                    "pembahasan": "PKP adalah Pengusaha Kena Pajak"
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/admin/questions/bulk", json=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/questions/bulk", False, f"Status: {response.status_code}, Body: {response.text}")
            return
        
        log_test("POST /api/admin/questions/bulk returns 200", True)
        
        result = response.json()
        
        if "inserted" not in result:
            log_test("Response contains 'inserted' count", False, f"Keys: {result.keys()}")
            return
        
        log_test("Response contains 'inserted' count", True)
        
        inserted = result.get("inserted", 0)
        
        if inserted != 2:
            log_test("Inserted count is correct", False, f"Expected 2, got {inserted}")
        else:
            log_test("Inserted 2 questions via bulk", True)
            print(f"   Inserted: {inserted} questions")
    
    except Exception as e:
        log_test("POST /api/admin/questions/bulk", False, str(e))

def test_admin_get_results(token: str):
    """Test 11: GET /api/admin/results"""
    print("\n" + "="*80)
    print("TEST 11: GET /api/admin/results")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/admin/results", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("GET /api/admin/results returns 200", False, f"Status: {response.status_code}")
            return
        
        log_test("GET /api/admin/results returns 200", True)
        
        results = response.json()
        
        if not isinstance(results, list):
            log_test("Response is a list", False, f"Got type: {type(results)}")
            return
        
        log_test("Response is a list", True)
        print(f"   Total results: {len(results)}")
    
    except Exception as e:
        log_test("GET /api/admin/results", False, str(e))

def test_admin_subjects_crud(token: str):
    """Test 12: Admin subjects CRUD"""
    print("\n" + "="*80)
    print("TEST 12: Admin CRUD - Subjects")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # CREATE
    try:
        payload = {
            "code": "TEST1",
            "name": "Test Subject for CRUD",
            "short": "TEST",
            "level": "A",
            "durationMin": 60,
            "color": "#FF0000",
            "desc": "Test subject description",
            "order": 999
        }
        
        response = requests.post(f"{BASE_URL}/admin/subjects", json=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("POST /api/admin/subjects (create)", False, f"Status: {response.status_code}")
            return
        
        log_test("POST /api/admin/subjects (create)", True)
        
        created = response.json()
        subject_id = created.get("id")
        
        if not subject_id:
            log_test("Created subject has id", False, "No id in response")
            return
        
        log_test("Created subject has id", True)
        print(f"   Created subject ID: {subject_id}")
        
        # UPDATE
        update_payload = {
            "code": "TEST1",
            "name": "Test Subject for CRUD (Updated)",
            "short": "TEST",
            "level": "A",
            "durationMin": 90,
            "color": "#00FF00",
            "desc": "Updated description",
            "order": 999
        }
        
        response = requests.put(f"{BASE_URL}/admin/subjects/{subject_id}", json=update_payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("PUT /api/admin/subjects/{id} (update)", False, f"Status: {response.status_code}")
        else:
            log_test("PUT /api/admin/subjects/{id} (update)", True)
        
        # DELETE (also removes questions/essays)
        response = requests.delete(f"{BASE_URL}/admin/subjects/{subject_id}", headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("DELETE /api/admin/subjects/{id}", False, f"Status: {response.status_code}")
        else:
            log_test("DELETE /api/admin/subjects/{id} (cascades to questions/essays)", True)
    
    except Exception as e:
        log_test("Admin CRUD - Subjects", False, str(e))

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def run_all_tests():
    """Run all backend API tests"""
    print("\n" + "="*80)
    print("BELAJAR BIAR PINTAR - BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    # PUBLIC ENDPOINTS
    print("\n\n" + "="*80)
    print("PUBLIC ENDPOINTS")
    print("="*80)
    
    # Test 1: Get subjects
    subjects = test_get_subjects()
    
    if not subjects:
        print("\n❌ Cannot continue without subjects")
        return
    
    # Use first subject for remaining tests
    subject_id = subjects[0]["id"]
    subject_name = subjects[0]["name"]
    print(f"\n📌 Using subject: {subject_name} (ID: {subject_id})")
    
    # Test 2: Get subject detail
    test_get_subject_detail(subject_id)
    test_get_subject_invalid()
    
    # Test 3: Get exam (CRITICAL - must not leak answers)
    exam_data = test_get_exam(subject_id)
    
    # Test 4: Submit exam
    if exam_data:
        test_submit_exam(subject_id, exam_data)
    
    # Test 5: Get essays
    test_get_essays(subject_id)
    
    # Test 6: Get results by candidate
    test_get_results_by_candidate("BBP-TEST-001")
    
    # ADMIN ENDPOINTS
    print("\n\n" + "="*80)
    print("ADMIN ENDPOINTS")
    print("="*80)
    
    # Test 7: Admin login
    token = test_admin_login_correct()
    test_admin_login_wrong()
    
    if not token:
        print("\n❌ Cannot continue without admin token")
        print_summary()
        return
    
    # Test 8: Admin auth
    test_admin_endpoint_without_auth(subject_id)
    test_admin_endpoint_with_auth(subject_id, token)
    
    # Test 9: Admin CRUD
    test_admin_crud_questions(subject_id, token)
    test_admin_crud_essays(subject_id, token)
    
    # Test 10: Bulk import
    test_admin_bulk_questions(subject_id, token)
    
    # Test 11: Admin results
    test_admin_get_results(token)
    
    # Test 12: Admin subjects CRUD
    test_admin_subjects_crud(token)
    
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
