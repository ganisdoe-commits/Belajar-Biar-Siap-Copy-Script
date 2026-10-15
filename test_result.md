#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Simulator CAT Ujian Kompetensi Pajak (Belajar Biar Pintar). Backend menyimpan soal + kunci jawaban di server, skoring server-side, panel admin untuk kelola soal, simpan hasil ujian."

backend:
  - task: "Public: list subjects & subject detail (with totalQuestions/essayCount)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/subjects and /api/subjects/{id}. Seeded 6 subjects Tingkat A."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: GET /api/subjects returns 200 with 6 subjects. Each subject includes id, name, totalQuestions, essayCount. GET /api/subjects/{id} returns 200 with single subject detail. GET /api/subjects/{invalid_id} correctly returns 404. All tests passed."
        -working: true
        -agent: "testing"
        -comment: "✅ RE-TESTED: GET /api/subjects now includes NEW FIELDS: bankSize, examCount, totalQuestions (=min(examCount,bankSize)), essayCount. KUP subject verified: bankSize=100, examCount=40, totalQuestions=40, essayCount=25. All 6 subjects have correct fields."
  - task: "Public: get exam questions WITHOUT answers"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/subjects/{id}/exam must NOT include answer/pembahasan fields."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: GET /api/subjects/{id}/exam returns 200 with structure {subject, duration_sec, questions}. CRITICAL SECURITY CHECK PASSED: Questions contain ONLY id, number, question, options fields. NO 'answer' or 'pembahasan' fields leaked to client. Tested with 5 questions."
        -working: true
        -agent: "testing"
        -comment: "✅ RE-TESTED: GET /api/subjects/{kup_id}/exam now returns RANDOM SAMPLE of exactly 40 questions from 100-question bank. CRITICAL SECURITY: Questions contain ONLY id, number, question, options (NO answer/pembahasan). RANDOMIZATION VERIFIED: Called endpoint twice, got different question sets (16/40 overlap, confirming random sampling). All checks passed."
  - task: "Public: submit exam -> server-side scoring + review"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "POST /api/exam/submit computes score=correct/total*100, passed>=60, saves result, returns review with answers+pembahasan."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: POST /api/exam/submit returns 200 with {result, review}. Score calculation verified: correct/total*100 rounded to 2 decimals. Passed logic verified: score>=60. Counts consistency verified: correct+wrong+unanswered=total. Review items include answer, selected, is_correct, pembahasan. Result saved to database and retrievable via GET /api/results/{candidate_id}."
        -working: true
        -agent: "testing"
        -comment: "✅ RE-TESTED: POST /api/exam/submit with NEW question_ids parameter. CRITICAL CHECKS PASSED: (1) result.total=40 (NOT 100, scores only presented questions), (2) Counts consistent: correct+wrong+unanswered=40, (3) Score=round(correct/40*100,2), (4) Passed=(score>=60), (5) Review has 40 items with answer/selected/is_correct/pembahasan, (6) Review order matches question_ids. BACKWARD COMPAT: Submit WITHOUT question_ids still works (scores against all questions). All tests passed."
  - task: "Public: essays list + results by candidate"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/subjects/{id}/essays and GET /api/results/{candidate_id}."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: GET /api/subjects/{id}/essays returns 200 with list of essays including model_answer field. GET /api/results/{candidate_id} returns 200 with list of saved results for candidate. Tested with candidate_id 'BBP-TEST-001' and successfully retrieved 1 result."
        -working: true
        -agent: "testing"
        -comment: "✅ RE-TESTED: GET /api/subjects/{kup_id}/essays returns exactly 25 essays with question and model_answer fields. All checks passed."
  - task: "Admin auth + CRUD (subjects, questions, essays) + bulk import + results"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "POST /api/admin/login (password=<ADMIN_PASSWORD> -> token). All /api/admin/* require Bearer ADMIN_TOKEN. CRUD + bulk + results."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: POST /api/admin/login with correct password returns 200 with token '<legacy-token>'. Wrong password returns 401. Admin endpoints without auth return 401. Admin endpoints with Bearer token return 200. GET /api/admin/questions includes 'answer' field (verified). CRUD operations tested: POST/PUT/DELETE for questions, essays, subjects - all working. Bulk import: POST /api/admin/questions/bulk successfully inserted 2 questions. GET /api/admin/results returns all saved results. DELETE subject cascades to questions/essays. All 50 tests passed."
        -working: true
        -agent: "testing"
        -comment: "✅ RE-TESTED: Admin login works (password=<ADMIN_PASSWORD>, token=<legacy-token>). GET /api/admin/questions?subject_id={kup_id} with Bearer token returns 100 questions WITH 'answer' field. All checks passed."

frontend:
  - task: "Frontend integration with backend API"
    implemented: true
    working: "NA"
    file: "frontend/src"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Integrated: api.js, ExamContext (async start/submit via API), Dashboard/PreExam/ExamScreen/ResultScreen/EssaySelect/EssayScreen fetch from API. Verified manually via screenshots: exam flow (login->subject->token->exam->submit->result with server scoring) and admin panel (login, question list, add dialog) work. Not yet run through automated frontend testing agent (awaiting user permission)."
  - task: "Admin panel (login + CRUD questions/essays + results)"
    implemented: true
    working: "NA"
    file: "frontend/src/pages/admin, frontend/src/components/admin"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "AdminLogin + AdminDashboard (tabs) + QuestionManager/EssayManager/ResultsTable. Verified via screenshot."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "RETEST needed after changes: (1) GET /api/subjects/{id}/exam now returns a RANDOM sample of examCount (default 40) questions from the bank (KUP has 100 questions, examCount=40, so exam should return exactly 40, no 'answer'/'pembahasan' leaked). (2) Public subjects now include bankSize, examCount, and totalQuestions=min(examCount,bankSize). (3) POST /api/exam/submit now accepts question_ids (list of presented question ids); scoring must be based ONLY on those (total=len(question_ids)); score=round(correct/total*100,2), passed>=60; review returned for those ids. Backward compat: if question_ids empty, score against all. Admin endpoints unchanged (password <ADMIN_PASSWORD>, Bearer <legacy-token>). KUP subject now has 100 MCQ + 25 essays imported. Please focus on exam sampling + submit scoring with question_ids."
    -agent: "testing"
    -message: "✅ ALL 50 BACKEND TESTS PASSED! Comprehensive testing completed: (1) Public endpoints: subjects list/detail, exam retrieval, exam submission with scoring, essays, results by candidate - all working. (2) CRITICAL SECURITY: Verified exam endpoint does NOT leak answer/pembahasan fields. (3) Scoring logic verified: correct/total*100, passed>=60, counts consistent. (4) Admin auth: login working, wrong password returns 401, protected endpoints require Bearer token. (5) Admin CRUD: questions, essays, subjects - create/update/delete all working. (6) Bulk import: successfully inserted multiple questions. (7) Admin results endpoint working. Backend is production-ready. Frontend integration can proceed."
    -agent: "testing"
    -message: "✅ ALL 36 RE-TESTS PASSED! New exam logic verified: (1) GET /api/subjects includes bankSize, examCount, totalQuestions fields. KUP: bankSize=100, examCount=40, totalQuestions=40, essayCount=25 ✓. (2) GET /api/subjects/{kup_id}/exam returns exactly 40 random questions from 100-question bank. NO answer/pembahasan leaked ✓. Randomization verified (different sets on repeated calls) ✓. (3) POST /api/exam/submit with question_ids: result.total=40 (NOT 100) ✓, counts consistent ✓, score=round(correct/40*100,2) ✓, passed=(score>=60) ✓, review has 40 items in correct order ✓. (4) Backward compat: submit WITHOUT question_ids scores against all questions ✓. (5) Regression: KUP essays=25 ✓, admin login works ✓, admin questions include answer field ✓. Backend changes are working correctly. Ready for production."