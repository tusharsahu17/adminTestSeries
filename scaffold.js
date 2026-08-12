const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const writeFile = (filePath, content) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  }
};

// 1. Pages
const pageContent = (title) => `import React from 'react';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${title}</h1>
      <p>Welcome to the ${title} page.</p>
    </div>
  );
}
`;

const pages = [
  { path: 'app/dashboard/page.tsx', title: 'Dashboard' },
  { path: 'app/dashboard/profile/page.tsx', title: 'Profile' },
  { path: 'app/dashboard/test-series/page.tsx', title: 'Test Series' },
  { path: 'app/dashboard/tests/page.tsx', title: 'Tests' },
  { path: 'app/dashboard/results/page.tsx', title: 'Results' },
  
  { path: 'app/admin/layout.tsx', content: `import React from 'react';\n\nexport default function AdminLayout({ children }: { children: React.ReactNode }) {\n  return <div className="admin-layout flex h-screen"><aside className="w-64 bg-gray-900 text-white p-4">Admin Sidebar</aside><main className="flex-1 overflow-auto bg-gray-50">{children}</main></div>;\n}\n` },
  { path: 'app/admin/page.tsx', title: 'Admin Dashboard' },
  { path: 'app/admin/users/page.tsx', title: 'User Management' },
  { path: 'app/admin/test-series/page.tsx', title: 'Test Series Management' },
  { path: 'app/admin/tests/page.tsx', title: 'Test Management' },
  { path: 'app/admin/questions/page.tsx', title: 'Question Bank' },
  { path: 'app/admin/subjects/page.tsx', title: 'Subjects & Topics' },
  { path: 'app/admin/results/page.tsx', title: 'Results Management' },
  { path: 'app/admin/leaderboard/page.tsx', title: 'Leaderboard' },
  { path: 'app/admin/payments/page.tsx', title: 'Payments & Orders' },
  { path: 'app/admin/subscriptions/page.tsx', title: 'Subscriptions' },
  { path: 'app/admin/coupons/page.tsx', title: 'Coupons' },
  { path: 'app/admin/notifications/page.tsx', title: 'Notifications' },
  { path: 'app/admin/analytics/page.tsx', title: 'Analytics' },
  { path: 'app/admin/support/page.tsx', title: 'Support Tickets' },
  { path: 'app/admin/admins/page.tsx', title: 'Admin Management' },
  { path: 'app/admin/settings/page.tsx', title: 'Admin Settings' }
];

pages.forEach(p => {
  const fullPath = path.join(srcDir, p.path);
  ensureDir(path.dirname(fullPath));
  writeFile(fullPath, p.content || pageContent(p.title));
});

// 2. Components
const componentContent = (name) => `import React from 'react';\n\nexport default function ${name}() {\n  return <div>${name}</div>;\n}\n`;

const components = [
  'components/ui/Button.tsx',
  'components/ui/Input.tsx',
  'components/ui/Modal.tsx',
  'components/ui/Table.tsx',
  'components/ui/Pagination.tsx',
  'components/ui/Loader.tsx',
  'components/admin/AdminSidebar.tsx',
  'components/admin/AdminHeader.tsx',
  'components/admin/DashboardStats.tsx',
  'components/admin/UserTable.tsx',
  'components/admin/TestSeriesTable.tsx',
  'components/admin/TestTable.tsx',
  'components/admin/QuestionTable.tsx',
  'components/admin/ResultTable.tsx',
  'components/admin/PaymentTable.tsx',
  'components/admin/AnalyticsChart.tsx'
];

components.forEach(c => {
  const fullPath = path.join(srcDir, c);
  ensureDir(path.dirname(fullPath));
  const name = path.basename(c, '.tsx');
  writeFile(fullPath, componentContent(name));
});

// 3. Constants
const constants = [
  { path: 'constants/roles.ts', content: `export const ROLES = {\n  ADMIN: 'admin',\n  USER: 'user',\n};\n` },
  { path: 'constants/routes.ts', content: `export const ROUTES = {\n  HOME: '/',\n  LOGIN: '/auth',\n  DASHBOARD: '/dashboard',\n  ADMIN: '/admin',\n};\n` }
];

constants.forEach(c => {
  const fullPath = path.join(srcDir, c.path);
  ensureDir(path.dirname(fullPath));
  writeFile(fullPath, c.content);
});

// 4. Features (Slices, Types, Services)
const features = [
  'user', 'testSeries', 'test', 'question', 'subject', 'result',
  'leaderboard', 'payment', 'subscription', 'coupon', 'notification',
  'analytics', 'support', 'admin', 'setting'
];

const sliceContent = (name) => `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ${name.charAt(0).toUpperCase() + name.slice(1)}State {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ${name.charAt(0).toUpperCase() + name.slice(1)}State = {
  items: [],
  isLoading: false,
  error: null,
};

const ${name}Slice = createSlice({
  name: '${name}',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<any[]>) {
      state.items = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setItems, setLoading, setError } = ${name}Slice.actions;

export const select${name.charAt(0).toUpperCase() + name.slice(1)}Items = (state: any) => state.${name}.items;
export const select${name.charAt(0).toUpperCase() + name.slice(1)}Loading = (state: any) => state.${name}.isLoading;

export default ${name}Slice.reducer;
`;

const serviceContent = (name) => `import apiClient from '../apiClient';

export const get${name.charAt(0).toUpperCase() + name.slice(1)}s = async () => {
  const response = await apiClient.get('/api/admin/${name.toLowerCase()}s');
  return response.data;
};
`;

const typeContent = (name) => `export interface ${name.charAt(0).toUpperCase() + name.slice(1)} {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}
`;

features.forEach(f => {
  // Slices
  const slicePath = path.join(srcDir, 'store/slices', f + 'Slice.ts');
  ensureDir(path.dirname(slicePath));
  writeFile(slicePath, sliceContent(f));

  // Services
  const servicePath = path.join(srcDir, 'services/admin', f + 'Service.ts');
  ensureDir(path.dirname(servicePath));
  writeFile(servicePath, serviceContent(f));

  // Types
  const typePath = path.join(srcDir, 'types/admin', f + '.ts');
  ensureDir(path.dirname(typePath));
  writeFile(typePath, typeContent(f));
});

console.log('Scaffolding complete!');
