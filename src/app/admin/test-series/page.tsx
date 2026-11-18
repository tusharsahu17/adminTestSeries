'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';

export default function TestSeriesPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to tests management
    const timeout = setTimeout(() => {
      router.replace('/admin/tests');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] text-center p-6 space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
        <Layers className="w-7 h-7" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Direct Test Architecture Active</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          The Test Series wrapper layer has been removed. Tests are now directly organized under{' '}
          <strong className="text-gray-700">Exams &rarr; Subjects &rarr; Tests &rarr; Questions</strong>.
        </p>
        <p className="text-xs text-gray-400">Redirecting to Tests Management...</p>
      </div>
      <Link
        href="/admin/tests"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
      >
        Go to Tests <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
