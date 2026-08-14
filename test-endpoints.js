const axios = require('axios');

async function testEndpoints() {
  const baseUrl = 'http://localhost:5000';
  const endpoints = [
    '/api/admin/dashboard',
    '/api/admin/users',
    '/api/admin/leaderboards/settings',
    '/api/admin/leaderboards/overall',
    '/api/admin/test-series',
    '/api/admin/tests',
    '/api/admin/questions',
    '/api/subjects'
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(baseUrl + ep);
      console.log(`[OK] ${ep}: ${res.status}`);
    } catch (err) {
      if (err.response) {
        console.error(`[ERROR] ${ep}: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else {
        console.error(`[ERROR] ${ep}: ${err.message}`);
      }
    }
  }
}

testEndpoints();
