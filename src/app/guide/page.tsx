import React from 'react';

export default function GuidePage() {
  return (
    <div className="guide-wrapper">
      <style dangerouslySetInnerHTML={{
        __html: `
        .guide-wrapper { box-sizing:border-box; font-family:Arial,sans-serif; background:#f5f7fb; color:#172033; line-height:1.6; }
        .guide-wrapper * { box-sizing:border-box; }
        .guide-layout { display:flex; min-height:100vh; }
        .guide-side { width:240px; background:#111827; color:#fff; padding:22px 14px; position:fixed; inset:0 auto 0 0; z-index: 50; overflow-y: auto; }
        .guide-side h2 { padding:0 10px; }
        .guide-side a { display:block; color:#cbd5e1; text-decoration:none; padding:9px 10px; border-radius:7px; }
        .guide-side a:hover { background:#1f2937; color:#fff; }
        .guide-main { margin-left:240px; padding:32px; max-width:1250px; width:calc(100% - 240px); }
        .guide-hero { background:#2563eb; color:white; padding:30px; border-radius:15px; margin-bottom:22px; }
        .guide-hero h1 { margin:0 0 6px; }
        .guide-section { background:white; border:1px solid #e5e7eb; border-radius:13px; padding:24px; margin-bottom:20px; box-shadow:0 2px 7px #00000008; }
        .guide-flow { display:flex; gap:10px; align-items:center; justify-content:center; flex-wrap:wrap; margin:20px 0; }
        .guide-box { padding:13px 18px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:9px; color:#1e3a8a; font-weight:bold; }
        .guide-arrow { font-size:22px; color:#64748b; }
        .guide-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
        .guide-card { padding:17px; border:1px solid #e5e7eb; border-radius:10px; background:#fafafa; }
        .guide-card h3 { margin-top:0; }
        .guide-pre { background:#0f172a; color:#e2e8f0; padding:20px; border-radius:9px; overflow:auto; margin: 10px 0; }
        .guide-note { background:#eff6ff; border-left:4px solid #2563eb; padding:13px 15px; margin-top:14px; }
        .guide-step { display:flex; gap:12px; margin:15px 0; }
        .guide-num { background:#2563eb; color:#fff; width:30px; height:30px; border-radius:50%; display:grid; place-items:center; font-weight:bold; flex:none; }
        .guide-table { width:100%; border-collapse:collapse; margin-top: 10px; }
        .guide-table th, .guide-table td { text-align:left; padding:11px; border-bottom:1px solid #e5e7eb; }
        .guide-table th { background:#f8fafc; }
        .guide-details { padding:13px 0; border-bottom:1px solid #e5e7eb; }
        .guide-summary { cursor:pointer; font-weight:bold; }
        .guide-code { background:#f1f5f9; padding:2px 5px; border-radius:4px; }
        @media(max-width:750px){
          .guide-side { position:static; width:100%; height:auto; }
          .guide-layout { display:block; }
          .guide-main { margin:0; width:100%; padding:16px; }
        }
      `}} />

      <div className="guide-layout">
        <aside className="guide-side">
          <h2>Admin Guide</h2>
          <a href="#overview">Overview</a>
          <a href="#content">Content Flow</a>
          <a href="#exams">Exams & Subjects</a>
          <a href="#tests">Tests</a>
          <a href="#questions">Questions</a>
          <a href="#direct-architecture">Direct Architecture</a>
          <a href="#architecture-status">Architecture Status</a>
          <a href="#attempts">Attempts & Results</a>
          <a href="#leaderboards">Leaderboards</a>
          <a href="#database">Database Flow</a>
          <a href="#workflow">Admin Workflow</a>
          <a href="#faq">FAQ</a>
        </aside>
        
        <main className="guide-main">
          <div className="guide-hero" id="overview">
            <h1>Exam & Test Platform — Admin System Guide</h1>
            <p>Quick reference for understanding how Exams, Subjects, Tests, Questions, Test Series, Attempts and Leaderboards are connected.</p>
          </div>

          <section className="guide-section" id="content">
            <h2>1. Main Content Flow</h2>
            <div className="guide-flow">
              <div className="guide-box">📚 Exam</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">📖 Subject</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">📝 Test</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">❓ Questions</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">🔘 Options</div>
            </div>
            <div className="guide-note"><b>Simple rule:</b> Create an Exam → add Subjects → create Tests under Subjects → add Questions to Tests.</div>
          </section>

          <section className="guide-section" id="exams">
            <h2>2. Exams → Subjects (Optional)</h2>
            <p>An Exam is an <strong>optional grouping</strong>, such as CGPSC, JEE or NEET. You do <strong>not</strong> need to create an exam if you just want to conduct tests.</p>
            <div className="guide-note" style={{ background: '#ecfdf5', borderColor: '#10b981', color: '#065f46' }}>
              <b>💡 Fast Flow Tip:</b> If you only want to create and conduct a test, you can completely skip creating an Exam! Tests connect directly to Subjects. Students will still see the test in their Dashboard and Available Tests tab.
            </div>
            <div className="guide-grid" style={{ marginTop: '16px' }}>
              <div className="guide-card">
                <h3>📚 Exam (Optional)</h3>
                <p>Example: <b>CGPSC</b>. Optional folder to group subjects together.</p>
              </div>
              <div className="guide-card">
                <h3>📖 Subject (Required)</h3>
                <p>Examples: History, Geography, Polity, Economics. Tests belong directly to subjects.</p>
              </div>
            </div>
            <p style={{ marginTop: '14px' }}><b>Database:</b> <code className="guide-code">exams</code> → <code className="guide-code">exam_subjects</code> → <code className="guide-code">subjects</code> (Many-to-Many)</p>
          </section>

          <section className="guide-section" id="tests">
            <h2>3. Subjects → Tests</h2>
            <p>Each Test belongs directly to one Subject.</p>
            <pre className="guide-pre">{`CGPSC
└── General Studies
    ├── History Mock Test 1
    ├── Geography Mock Test 1
    ├── Polity Mock Test 1
    └── Full Mock Test 1`}</pre>
            <table className="guide-table">
              <thead>
                <tr><th>Field</th><th>Example</th></tr>
              </thead>
              <tbody>
                <tr><td>Test Name</td><td>CGPSC History Mock Test 1</td></tr>
                <tr><td>Subject</td><td>History</td></tr>
                <tr><td>Duration</td><td>60 Minutes</td></tr>
                <tr><td>Total Marks</td><td>100</td></tr>
                <tr><td>Passing Marks</td><td>40</td></tr>
                <tr><td>Status</td><td>Published</td></tr>
              </tbody>
            </table>
            <div className="guide-note"><b>Database:</b> <code className="guide-code">tests.subject_id</code> connects every test to its subject.</div>
          </section>

          <section className="guide-section" id="questions">
            <h2>4. Tests → Questions → Options</h2>
            <div className="guide-flow">
              <div className="guide-box">📝 Test</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">❓ Question</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">A / B / C / D</div>
            </div>
            <div className="guide-card" style={{ marginTop: '20px' }}>
              <b>Example:</b><br/>Who was the first Chief Minister of Madhya Pradesh?<br/><br/>
              A. Ravishankar Shukla<br/>
              B. Bhagwantrao Mandloi<br/>
              C. Kailash Nath Katju<br/>
              D. Govind Narayan Singh<br/><br/>
              <b>Correct:</b> A &nbsp; <b>Marks:</b> 1 &nbsp; <b>Negative:</b> 0.25 &nbsp; <b>Difficulty:</b> Medium
            </div>
            <p style={{ marginTop: '20px' }}><b>Database:</b> <code className="guide-code">tests</code> → <code className="guide-code">questions</code> → <code className="guide-code">question_options</code></p>
            <div className="guide-note"><b>Bulk Upload:</b> Admin can upload Excel/CSV to create multiple questions and their options at once.</div>
          </section>

          <section className="guide-section" id="direct-architecture">
            <h2>5. Direct Test Architecture</h2>
            <p>The Test Series wrapper layer has been completely removed from the backend architecture, allowing students to browse and attempt tests directly under Subjects and Exams.</p>
            <pre className="guide-pre">{`Direct Hierarchy:
Exams
  ↓
Subjects
  ↓
Tests (Published & Active)
  ↓
Questions & Options
  ↓
Test Attempts (/api/student/tests/:id/start)
  ↓
Results & Leaderboards`}</pre>
            <p><b>Database:</b> <code className="guide-code">exams</code> ↔ <code className="guide-code">exam_subjects</code> ↔ <code className="guide-code">subjects</code> → <code className="guide-code">tests</code> → <code className="guide-code">questions</code></p>
            <div className="guide-note">Tests belong directly to Subjects, and Subjects can be organized under Exams. Students attempt tests directly without any test series enrollment barrier.</div>
          </section>

          <section className="guide-section" id="architecture-status">
            <h2>5A. Modernized Backend Architecture & Removed Endpoints</h2>
            <div className="guide-note">
              <b>Status: Test Series Layer Retired</b><br/>
              The backend architecture has been simplified to direct test access. All obsolete test series endpoints and files have been removed.
            </div>

            <h3>Key Architectural Changes</h3>
            <div className="guide-grid">
              <div className="guide-card">
                <h3>🚀 Direct Test Discovery</h3>
                <p>Students browse published and active tests directly from the <code className="guide-code">tests</code> and <code className="guide-code">subjects</code> tables without test series filters or enrollment barriers.</p>
              </div>
              <div className="guide-card">
                <h3>⚡ Direct Attempt Creation</h3>
                <p>Students create attempts directly via <code className="guide-code">/api/student/tests/:testId/start</code> (or <code className="guide-code">/api/tests/:testId/start</code>) with zero prerequisites.</p>
              </div>
              <div className="guide-card">
                <h3>🏆 Direct Leaderboards</h3>
                <p>Category and subject leaderboards compute rankings directly by joining tests with subjects and exams.</p>
              </div>
              <div className="guide-card">
                <h3>🔔 Direct Notifications</h3>
                <p>New test notifications publish directly to all students without series membership filtering.</p>
              </div>
            </div>

            <h3 style={{ marginTop: '20px' }}>Removed Backend Files & Endpoints</h3>
            <table className="guide-table">
              <thead>
                <tr><th>Removed Item</th><th>Previous Path / Route</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>Test Series Routes</td><td><code className="guide-code">/api/admin/test-series</code> (src/routes/adminTestSeriesRoutes.js)</td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Deleted</span></td></tr>
                <tr><td>Test Series Controller</td><td><code className="guide-code">src/controllers/adminTestSeriesController.js</code></td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Deleted</span></td></tr>
                <tr><td>Test Series Model</td><td><code className="guide-code">src/models/testSeriesModel.js</code></td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Deleted</span></td></tr>
                <tr><td>Init Test Series</td><td><code className="guide-code">src/config/initTestSeries.js</code></td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Deleted</span></td></tr>
                <tr><td>Dashboard Series</td><td><code className="guide-code">/dashboard/test-series</code> &amp; <code className="guide-code">/test-series/:id</code></td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Deleted</span></td></tr>
                <tr><td>Leaderboard Series</td><td><code className="guide-code">/series/:seriesId</code> in adminLeaderboardRoutes</td><td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Deleted</span></td></tr>
              </tbody>
            </table>
          </section>

          <section className="guide-section" id="attempts">
            <h2>6. User → Attempt → Result</h2>
            <div className="guide-flow">
              <div className="guide-box">👤 User</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">▶ Start Test</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">📝 Attempt</div>
              <span className="guide-arrow">→</span>
              <div className="guide-box">📊 Result</div>
            </div>
            <pre className="guide-pre">{`User
└── Test Attempt
    ├── Question 1 → Selected Option B
    ├── Question 2 → Selected Option A
    ├── Question 3 → Selected Option C
    └── ...
          ↓
      Calculate Score
          ↓
      Final Result`}</pre>
            <div className="guide-grid">
              <div className="guide-card">
                <h3>test_attempts</h3>
                <p>Stores user, test, attempt status, score and percentage.</p>
              </div>
              <div className="guide-card">
                <h3>attempt_answers</h3>
                <p>Stores the question and option selected by the user.</p>
              </div>
            </div>
            <div className="guide-note"><b>Scoring:</b> Selected options are checked against the correct options and Marks/Negative Marks are applied.</div>
          </section>

          <section className="guide-section" id="leaderboards">
            <h2>7. Leaderboards</h2>
            <div className="guide-grid">
              <div className="guide-card">
                <h3>🏆 Test Leaderboard</h3>
                <p>Ranks users for a specific test using their best score.</p>
              </div>
              <div className="guide-card">
                <h3>🏆 Series Leaderboard</h3>
                <p>Combines a user's best scores from tests in a series.</p>
              </div>
              <div className="guide-card">
                <h3>📅 Time Leaderboard</h3>
                <p>Can calculate all-time, monthly or weekly rankings.</p>
              </div>
            </div>
            <div className="guide-note">Leaderboards are calculated from completed attempts; admins do not manually maintain rankings.</div>
          </section>

          <section className="guide-section" id="database">
            <h2>8. Complete Database Flow</h2>
            <pre className="guide-pre">{`EXAMS
  ↓
EXAM_SUBJECTS
  ↓
SUBJECTS
  ↓
TESTS ─────────→ TEST_SERIES_TESTS ─────────→ TEST_SERIES
  ↓
QUESTIONS
  ↓
QUESTION_OPTIONS

USERS
  ↓
TEST_ATTEMPTS ─────────→ TESTS
  ↓
ATTEMPT_ANSWERS ───────→ QUESTIONS
        └───────────────→ QUESTION_OPTIONS
  ↓
RESULT / SCORE
  ↓
LEADERBOARDS`}</pre>
          </section>

          <section className="guide-section" id="workflow">
            <h2>9. Recommended Admin Workflow</h2>
            <div className="guide-step"><span className="guide-num">1</span><div><b>Create Exam</b><br/>Example: CGPSC, JEE, NEET.</div></div>
            <div className="guide-step"><span className="guide-num">2</span><div><b>Add Subjects & Topics</b><br/>History, Geography, Physics, Chemistry, etc.</div></div>
            <div className="guide-step"><span className="guide-num">3</span><div><b>Create Tests</b><br/>Create tests directly under each subject.</div></div>
            <div className="guide-step"><span className="guide-num">4</span><div><b>Add Questions</b><br/>Add questions from Question Bank or Quick Create.</div></div>
            <div className="guide-step"><span className="guide-num">5</span><div><b>Publish Test</b><br/>Make test immediately accessible to students.</div></div>
            <div className="guide-step"><span className="guide-num">6</span><div><b>Monitor Attempts & Results</b><br/>View live attempts, accuracy, and student scores.</div></div>
            <div className="guide-step"><span className="guide-num">7</span><div><b>Check Leaderboards</b><br/>Overall, exam category, and subject rankings.</div></div>
          </section>

          <section className="guide-section">
            <h2>10. One-Minute Understanding</h2>
            <pre className="guide-pre">{`HIERARCHY
Exam → Subject → Test → Questions → Options

STUDENT ATTEMPT FLOW
Student → Discovers Test under Subject/Exam → Starts Attempt → Submits Answers → Result

RANKING & ANALYTICS
Attempts & Scores → Category Leaderboard → Subject Leaderboard → Overall Ranking`}</pre>
          </section>

          <section className="guide-section" id="faq">
            <h2>11. Quick FAQ</h2>
            <details className="guide-details" open><summary className="guide-summary">Do I need to create an Exam to conduct a Test? Will it work on the User Panel?</summary><p><strong>No Exam needed!</strong> A test connects directly to a Subject (<code className="guide-code">tests.subject_id</code>). When you create a Test and mark it <em>Published</em>, it immediately appears on the user panel under <strong>Available Tests</strong> and the student's <strong>Dashboard</strong>. Students can start the test, submit answers, and view their scorecards without an Exam.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Exam have multiple Subjects?</summary><p>Yes. Exams and Subjects use the <code className="guide-code">exam_subjects</code> junction table.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Subject have multiple Tests?</summary><p>Yes. Each Test has a <code className="guide-code">subject_id</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Test have multiple Questions?</summary><p>Yes. Questions contain a <code className="guide-code">test_id</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Question have multiple Options?</summary><p>Yes. Options are stored in <code className="guide-code">question_options</code> using <code className="guide-code">question_id</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Do students need test series enrollment to take tests?</summary><p>No. The test series layer has been completely removed. Students can discover and start any published active test directly under Subjects &amp; Exams.</p></details>
            <details className="guide-details"><summary className="guide-summary">Do admins create leaderboard records manually?</summary><p>No. Rankings are automatically calculated from completed attempts and scores.</p></details>
            <details className="guide-details"><summary className="guide-summary">Where are student answers stored?</summary><p>In <code className="guide-code">attempt_answers</code>, linked to the attempt, question and selected option.</p></details>
          </section>

          <p style={{ textAlign:'center', color:'#64748b', fontSize:'13px', marginTop: '30px' }}>
            Admin System Guide • Exam & Test Platform
          </p>
        </main>
      </div>
    </div>
  );
}
