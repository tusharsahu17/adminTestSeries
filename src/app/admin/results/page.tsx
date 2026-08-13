'use client';
import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2, Search, Filter, Eye, RefreshCw, BarChart2, X, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ResultsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  
  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc'>('score-desc');
  
  // Modals state
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const testsRes = await adminService.getTests();
        const testData = testsRes.tests || testsRes.data?.tests || testsRes.data || testsRes || [];
        setTests(Array.isArray(testData) ? testData : []);
        
        // Select first test by default
        if (testData.length > 0) {
          const firstTestId = testData[0].id.toString();
          setSelectedTest(firstTestId);
          fetchResults(firstTestId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch tests for results:', err);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchResults = async (testId: string) => {
    setLoading(true);
    try {
      const res = await adminService.getTestResults(testId);
      const resData = res.results || res.data?.results || res.data || res || [];
      setResults(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = e.target.value;
    setSelectedTest(testId);
    fetchResults(testId);
  };

  const handleRecalculate = async () => {
    if (!selectedTest || !confirm('Are you sure you want to recalculate all results for this test? This might take a while.')) return;
    
    setRecalculating(true);
    try {
      await adminService.recalculateResults(selectedTest);
      alert('Recalculation triggered successfully. Results will update shortly.');
      fetchResults(selectedTest);
    } catch (err) {
      console.error('Recalculation failed:', err);
      alert('Failed to recalculate results.');
    } finally {
      setRecalculating(false);
    }
  };

  const toggleSort = () => {
    setSortBy(prev => prev === 'score-desc' ? 'score-asc' : 'score-desc');
  };

  const openSubmission = async (attemptId: string) => {
    setIsSubmissionOpen(true);
    setLoadingSubmission(true);
    setSubmissionData(null);
    try {
      const res = await adminService.getIndividualResult(attemptId);
      setSubmissionData(res.data || res.result || res);
    } catch (err) {
      console.error('Failed to fetch submission', err);
    } finally {
      setLoadingSubmission(false);
    }
  };

  const selectedTestObj = tests.find(t => t.id.toString() === selectedTest);
  
  // Memoized filtered and sorted results
  const filteredResults = useMemo(() => {
    let filtered = results.filter(res => {
      const studentName = (res.user?.name || res.username || '').toLowerCase();
      return studentName.includes(searchTerm.toLowerCase());
    });
    
    filtered = filtered.sort((a, b) => {
      const scoreA = Number(a.score) || 0;
      const scoreB = Number(b.score) || 0;
      if (sortBy === 'score-desc') return scoreB - scoreA;
      return scoreA - scoreB;
    });
    
    return filtered;
  }, [results, searchTerm, sortBy]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
          <p className="text-sm text-gray-500">Analyze test attempts and recalculate scores.</p>
        </div>
        <button 
          onClick={handleRecalculate}
          disabled={!selectedTest || recalculating}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-indigo-600 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
          Recalculate Results
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Select Test</label>
              <select 
                value={selectedTest}
                onChange={handleTestChange}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5"
              >
                {tests.map(test => (
                  <option key={test.id} value={test.id}>{test.title || test.name}</option>
                ))}
                {tests.length === 0 && <option value="">No tests available</option>}
              </select>
            </div>
            
            <div className="flex-1 max-w-sm mt-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <button onClick={toggleSort} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <Filter className="w-4 h-4" /> 
              {sortBy === 'score-desc' ? 'Score: High to Low' : 'Score: Low to High'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attempt ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Percentile</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    {selectedTest ? 'No results found.' : 'Select a test to view results.'}
                  </td>
                </tr>
              ) : (
                filteredResults.map((res, idx) => (
                  <tr key={res.id || idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-sm text-gray-500">#{res.id || '-'}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {res.user?.name?.charAt(0) || res.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{res.user?.name || res.username || 'Unknown Student'}</p>
                          <p className="text-xs text-gray-500">Attempted: {new Date(res.created_at || res.createdAt || res.start_time || new Date()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-semibold text-gray-900">{Number(res.score).toFixed(2)}</span>
                      <span className="text-gray-500 text-xs"> / {selectedTestObj?.total_marks || res.total_marks || 100}</span>
                    </td>
                    <td className="py-3 px-5">
                      {res.rank ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          #{res.rank}
                        </span>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </td>
                    <td className="py-3 px-5 text-sm font-medium text-gray-600">
                      {res.percentile ? `${Number(res.percentile).toFixed(2)}%` : '-'}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openSubmission(res.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View Submission details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Submission Details Modal */}
      {isSubmissionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Submission Data
              </h3>
              <button onClick={() => setIsSubmissionOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {loadingSubmission ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : submissionData?.summary ? (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-1">Total Score</h4>
                      <p className="text-3xl font-bold text-indigo-700">
                        {Number(submissionData.summary.score).toFixed(2)} 
                        <span className="text-lg text-indigo-400 font-medium"> / {submissionData.summary.total_marks || '100'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-indigo-800 font-medium mb-1">Status: <span className="uppercase tracking-wider">{submissionData.summary.status}</span></p>
                      <p className="text-xs text-indigo-600">Submitted: {new Date(submissionData.summary.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Question Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total Qs</p>
                      <p className="text-xl font-bold text-gray-900">{submissionData.summary.total_questions}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                      <p className="text-xs text-green-600 font-medium uppercase mb-1">Correct</p>
                      <p className="text-xl font-bold text-green-700">{submissionData.summary.correct_answers}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                      <p className="text-xs text-red-600 font-medium uppercase mb-1">Wrong</p>
                      <p className="text-xl font-bold text-red-700">{submissionData.summary.wrong_answers}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center">
                      <p className="text-xs text-yellow-600 font-medium uppercase mb-1">Skipped</p>
                      <p className="text-xl font-bold text-yellow-700">{submissionData.summary.skipped_questions}</p>
                    </div>
                  </div>

                  {/* Time & Rank */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Time Taken</span>
                      <span className="font-bold text-gray-900">{Math.floor(submissionData.summary.time_taken_seconds / 60)}m {submissionData.summary.time_taken_seconds % 60}s</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Rank / Percentile</span>
                      <span className="font-bold text-gray-900">{submissionData.summary.rank ? `#${submissionData.summary.rank}` : '-'} / {submissionData.summary.percentage ? `${Number(submissionData.summary.percentage).toFixed(2)}%` : '-'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Failed to parse submission summary.
                </div>
              )}
            </div>
            <div className="pt-4 flex justify-end mt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsSubmissionOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
