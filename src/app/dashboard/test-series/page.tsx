'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function StudentTestSeriesPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/dashboard');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <BookOpen className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Direct Test Access Active</h2>
      <p className="text-sm text-gray-500 max-w-md">
        Tests are now accessible directly under your Subjects &amp; Exams without needing test series enrollment.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Go to Dashboard <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
