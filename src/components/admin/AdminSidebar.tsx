'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  target?: string;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: '⌂', exact: true }],
  },
  {
    title: 'Management',
    items: [
      { href: '/admin/users', label: 'Users', icon: '👥' },
      { href: '/admin/enrollments', label: 'Enrollments', icon: '🎓' },
      { href: '/admin/categories', label: 'Categories', icon: '📁' },
      { href: '/admin/exams', label: 'Exams', icon: '📝' },
      { href: '/admin/test-series', label: 'Test Series', icon: '▣' },
      { href: '/admin/tests', label: 'Tests', icon: '📝' },
      { href: '/admin/questions', label: 'Question Bank', icon: '❓' },
      { href: '/admin/subjects', label: 'Subjects', icon: '📚' },
      { href: '/admin/results', label: 'Results', icon: '📊' },
      { href: '/admin/leaderboards', label: 'Leaderboards', icon: '🏆' },
    ],
  },
  {
    title: 'Business',
    items: [
      { href: '/admin/payments', label: 'Payments', icon: '💳' },
      { href: '/admin/subscriptions', label: 'Subscriptions', icon: '⭐' },
      { href: '/admin/coupons', label: 'Coupons', icon: '🎟' },
      { href: '/admin/notifications', label: 'Notifications', icon: '🔔' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙' },
      { href: '/flow', label: 'App Flow', icon: '🔄' },
    ],
  },
  {
    title: 'Guide',
    items: [{ href: '/guide', label: 'Admin Guide', icon: '📖', target: '_blank' }],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">T</div>
        <span>Test Series</span>
      </div>

      <nav className="nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="section-label">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className={isActive(item) ? 'active' : undefined}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
