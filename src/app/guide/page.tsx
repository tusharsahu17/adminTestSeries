import React from 'react';

export default function GuidePage() {
  return (
    <div className="guide-wrapper">
      <style dangerouslySetInnerHTML={{
        __html: `
        .guide-wrapper { box-sizing:border-box; font-family:Arial,sans-serif; background:#f5f7fb; color:#172033; line-height:1.6; }
        .guide-wrapper * { box-sizing:border-box; }
        .guide-layout { display:flex; min-height:100vh; }
        .guide-side { width:240px; background:#111827; color:#fff; padding:22px 14px; position:fixed; inset:0 auto 0 0; z-index: 50; }
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
          <a href="#series">Test Series</a>
          <a href="#test-series-status">Series API Status</a>
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
            <h2>2. Exams → Subjects</h2>
            <p>An Exam is the top-level category, such as CGPSC, JEE or NEET.</p>
            <div className="guide-grid">
              <div className="guide-card">
                <h3>📚 Exam</h3>
                <p>Example: <b>CGPSC</b>. Contains multiple subjects.</p>
              </div>
              <div className="guide-card">
                <h3>📖 Subject</h3>
                <p>Examples: History, Geography, Polity, Economics. A subject can potentially be used by multiple exams.</p>
              </div>
            </div>
            <p><b>Database:</b> <code className="guide-code">exams</code> → <code className="guide-code">exam_subjects</code> → <code className="guide-code">subjects</code> (Many-to-Many)</p>
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

          <section className="guide-section" id="series">
            <h2>5. Test Series</h2>
            <p>A Test Series is a bundle containing multiple Tests.</p>
            <pre className="guide-pre">{`CGPSC Complete Mock Test Series
├── 1. History Mock Test
├── 2. Geography Mock Test
├── 3. Polity Mock Test
├── 4. Economics Mock Test
└── 5. Full Mock Test`}</pre>
            <p><b>Database:</b> <code className="guide-code">test_series</code> ↔ <code className="guide-code">test_series_tests</code> ↔ <code className="guide-code">tests</code> (Many-to-Many).</p>
            <div className="guide-note"><code className="guide-code">test_series_tests.display_order</code> controls the order of tests inside a series.</div>
          </section>

          <section className="guide-section" id="test-series-status">
            <h2>6A. Test Series — Implementation Status</h2>
            <div className="guide-note">
              <b>Status: Working condition</b><br/>
              The Test Series functionality is implemented across the database, model, controller, routes and app integration.
            </div>

            <h3>Implementation Checklist</h3>
            <div className="guide-grid">
              <div className="guide-card">
                <h3>🗄️ Database Schema</h3>
                <p><code className="guide-code">src/config/initTestSeries.js</code> creates:</p>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><code className="guide-code">test_series</code> — stores basic series details.</li>
                  <li><code className="guide-code">test_series_tests</code> — maps tests to a series and stores <code className="guide-code">display_order</code>.</li>
                </ul>
              </div>
              <div className="guide-card">
                <h3>🧩 Model</h3>
                <p><code className="guide-code">src/models/testSeriesModel.js</code> contains the required queries and features, including:</p>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Create and update</li>
                  <li>Duplicate series</li>
                  <li>Reorder tests</li>
                  <li>Publish/unpublish</li>
                  <li>Archive</li>
                </ul>
              </div>
              <div className="guide-card">
                <h3>🎮 Controller</h3>
                <p><code className="guide-code">src/controllers/adminTestSeriesController.js</code> handles the Test Series operations and connects the API requests to the model functions.</p>
              </div>
              <div className="guide-card">
                <h3>🛣️ Routes</h3>
                <p><code className="guide-code">src/routes/adminTestSeriesRoutes.js</code> maps the endpoints and includes Swagger documentation.</p>
              </div>
            </div>

            <h3>App Integration</h3>
            <div className="guide-card" style={{ marginTop: '20px' }}>
              <p>The routes are registered in <code className="guide-code">src/app.js</code>:</p>
              <pre className="guide-pre" style={{ margin: '10px 0' }}>app.use('/api/admin/test-series', adminTestSeriesRoutes);</pre>
            </div>

            <h3>Available API Endpoints</h3>
            <table className="guide-table">
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                <tr><td>GET</td><td>/api/admin/test-series</td><td>List all test series. Supports <code className="guide-code">is_published</code> and <code className="guide-code">is_archived</code> filters.</td></tr>
                <tr><td>POST</td><td>/api/admin/test-series</td><td>Create a new test series.</td></tr>
                <tr><td>GET</td><td>/api/admin/test-series/:id</td><td>Get a specific series, including its tests.</td></tr>
                <tr><td>PUT</td><td>/api/admin/test-series/:id</td><td>Update an existing test series.</td></tr>
                <tr><td>DELETE</td><td>/api/admin/test-series/:id</td><td>Permanently delete a test series.</td></tr>
                <tr><td>PATCH</td><td>/api/admin/test-series/:id/archive</td><td>Archive a test series.</td></tr>
                <tr><td>PATCH</td><td>/api/admin/test-series/:id/publish</td><td>Toggle publish status.</td></tr>
                <tr><td>POST</td><td>/api/admin/test-series/:id/duplicate</td><td>Duplicate a series and its linked tests.</td></tr>
                <tr><td>POST</td><td>/api/admin/test-series/:id/tests</td><td>Add a specific test to the series.</td></tr>
                <tr><td>PUT</td><td>/api/admin/test-series/:id/tests/reorder</td><td>Change the display order of tests in a series.</td></tr>
              </tbody>
            </table>

            <h3>Test Series API Flow</h3>
            <pre className="guide-pre">{`Admin
  ↓
Create Test Series
  ↓
test_series
  ↓
Add Tests
  ↓
test_series_tests
  ↓
Set display_order
  ↓
Publish
  ↓
Students can access the series

Additional actions:
  ├── Update
  ├── Archive
  ├── Duplicate
  └── Reorder Tests`}</pre>

            <div className="guide-note"><b>Database Initialization:</b> If the Test Series tables have not been initialized yet, run
            <code className="guide-code">node src/config/initTestSeries.js</code>.</div>
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
            <div className="guide-step"><span className="guide-num">1</span><div><b>Create Exam</b><br/>Example: CGPSC.</div></div>
            <div className="guide-step"><span className="guide-num">2</span><div><b>Add Subjects</b><br/>History, Geography, Polity, etc.</div></div>
            <div className="guide-step"><span className="guide-num">3</span><div><b>Create Tests</b><br/>Create tests under each subject.</div></div>
            <div className="guide-step"><span className="guide-num">4</span><div><b>Add Questions</b><br/>Add manually or use Bulk Upload.</div></div>
            <div className="guide-step"><span className="guide-num">5</span><div><b>Publish Test</b><br/>Make the test available to students.</div></div>
            <div className="guide-step"><span className="guide-num">6</span><div><b>Create Test Series</b><br/>Optional: group multiple tests into a package.</div></div>
            <div className="guide-step"><span className="guide-num">7</span><div><b>Monitor Results</b><br/>View attempts, scores and student performance.</div></div>
            <div className="guide-step"><span className="guide-num">8</span><div><b>Check Leaderboards</b><br/>View rankings generated from attempts.</div></div>
          </section>

          <section className="guide-section">
            <h2>10. One-Minute Understanding</h2>
            <pre className="guide-pre">{`CONTENT
Exam → Subject → Test → Questions → Options

PACKAGING
Tests → Test Series

STUDENT
User → Attempt → Answers → Result

RANKING
Results → Test Leaderboard → Series Leaderboard → Overall/Weekly/Monthly`}</pre>
          </section>

          <section className="guide-section" id="faq">
            <h2>11. Quick FAQ</h2>
            <details className="guide-details"><summary className="guide-summary">Can one Exam have multiple Subjects?</summary><p>Yes. Exams and Subjects use the <code className="guide-code">exam_subjects</code> junction table.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Subject have multiple Tests?</summary><p>Yes. Each Test has a <code className="guide-code">subject_id</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Test have multiple Questions?</summary><p>Yes. Questions contain a <code className="guide-code">test_id</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Question have multiple Options?</summary><p>Yes. Options are stored in <code className="guide-code">question_options</code> using <code className="guide-code">question_id</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Can one Test belong to multiple Test Series?</summary><p>Yes. This is handled by <code className="guide-code">test_series_tests</code>.</p></details>
            <details className="guide-details"><summary className="guide-summary">Do admins create leaderboard records manually?</summary><p>No. Rankings can be calculated from completed attempts and scores.</p></details>
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
