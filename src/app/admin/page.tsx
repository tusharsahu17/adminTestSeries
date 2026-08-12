import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <>
      <header className="topbar">
        <div className="title">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="admin">
          <div className="avatar">A</div>
          <span className="admin-name">Admin User</span>
        </div>
      </header>

      <section className="cards">
        <div className="card">
          <div className="stat-head"><span>Total Users</span><div className="stat-icon">👥</div></div>
          <div className="value">12,540</div>
          <div className="trend">↑ 12.5% this month</div>
        </div>
        <div className="card">
          <div className="stat-head"><span>Test Attempts</span><div className="stat-icon">📝</div></div>
          <div className="value">8,426</div>
          <div className="trend">↑ 8.2% this month</div>
        </div>
        <div className="card">
          <div className="stat-head"><span>Test Series</span><div className="stat-icon">📚</div></div>
          <div className="value">48</div>
          <div className="trend">↑ 4 new this month</div>
        </div>
        <div className="card">
          <div className="stat-head"><span>Revenue</span><div className="stat-icon">₹</div></div>
          <div className="value">₹2.84L</div>
          <div className="trend">↑ 16.8% this month</div>
        </div>
      </section>

      <section className="layout">
        <div className="card">
          <div className="card-title">
            <h2>Test Attempts</h2>
            <Link href="#">Last 7 days ▾</Link>
          </div>
          <div className="chart">
            <div className="bar-wrap"><div className="bar" style={{height: '38%'}}></div><div className="bar-label">Mon</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '55%'}}></div><div className="bar-label">Tue</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '48%'}}></div><div className="bar-label">Wed</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '72%'}}></div><div className="bar-label">Thu</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '63%'}}></div><div className="bar-label">Fri</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '86%'}}></div><div className="bar-label">Sat</div></div>
            <div className="bar-wrap"><div className="bar" style={{height: '69%'}}></div><div className="bar-label">Sun</div></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <h2>Top Test Series</h2>
            <Link href="#">View all →</Link>
          </div>
          <div className="series">
            <div className="series-row">
              <div className="series-name"><div className="mini">G</div><span>GATE CS 2026</span></div>
              <div className="progress"><span style={{width: '88%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">U</div><span>UPSC Prelims</span></div>
              <div className="progress"><span style={{width: '74%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">N</div><span>NEET Mock Tests</span></div>
              <div className="progress"><span style={{width: '62%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">J</div><span>JEE Main 2026</span></div>
              <div className="progress"><span style={{width: '51%'}}></span></div>
            </div>
            <div className="series-row">
              <div className="series-name"><div className="mini">C</div><span>CAT 2026</span></div>
              <div className="progress"><span style={{width: '43%'}}></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-title">
          <h2>Recent Users</h2>
          <Link href="#">View all →</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Test Series</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Rahul Sharma</strong></td>
              <td>rahul@example.com</td>
              <td>GATE CS 2026</td>
              <td>Today, 10:42 AM</td>
              <td><span className="status active-status">Active</span></td>
            </tr>
            <tr>
              <td><strong>Priya Singh</strong></td>
              <td>priya@example.com</td>
              <td>UPSC Prelims</td>
              <td>Today, 09:18 AM</td>
              <td><span className="status active-status">Active</span></td>
            </tr>
            <tr>
              <td><strong>Aman Verma</strong></td>
              <td>aman@example.com</td>
              <td>JEE Main 2026</td>
              <td>Yesterday</td>
              <td><span className="status pending">Pending</span></td>
            </tr>
            <tr>
              <td><strong>Neha Gupta</strong></td>
              <td>neha@example.com</td>
              <td>CAT 2026</td>
              <td>Yesterday</td>
              <td><span className="status active-status">Active</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
