'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  BookOpen,
  FileText,
  CheckSquare,
  ListPlus,
  AlertTriangle,
  Zap,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Monitor,
  FolderTree,
  Check,
} from 'lucide-react';

export default function FlowPage() {
  // Toggle or anchor to quickly view flows
  const [selectedFlow, setSelectedFlow] = useState<'both' | 'quick' | 'full'>('both');

  const fullSteps = [
    {
      id: 1,
      title: 'Category & Subject',
      description: 'The foundation of everything. Create basic building blocks first.',
      example: 'Category: Engineering | Subject: Physics',
      icon: Layers,
      color: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
      href: '/admin/categories',
    },
    {
      id: 2,
      title: 'Exam (Optional Group)',
      description: 'Optional top-level grouping for multiple subjects.',
      example: 'JEE Mains -> links to Physics & Math',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-600',
      border: 'border-indigo-200',
      href: '/admin/exams',
    },
    {
      id: 3,
      title: 'Test',
      description: 'Create a test under a specific subject.',
      example: 'Physics Mock Test 1 (under Physics)',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      border: 'border-purple-200',
      href: '/admin/tests',
    },
    {
      id: 4,
      title: 'Questions & Options',
      description: 'Add multiple choice questions to a specific Test using its ID.',
      example: 'Q1: What is velocity? + 4 Options',
      icon: CheckSquare,
      color: 'bg-pink-100 text-pink-600',
      border: 'border-pink-200',
      href: '/admin/questions',
    },
    {
      id: 5,
      title: 'Test Series',
      description: 'Create a bundled test series under a Category.',
      example: 'JEE Mains Premium Test Series',
      icon: ListPlus,
      color: 'bg-rose-100 text-rose-600',
      border: 'border-rose-200',
      href: '/admin/test-series',
    },
    {
      id: 6,
      title: 'Link Tests to Series',
      description: 'Select tests and add them to the Test Series in a specific order.',
      example: 'Add Physics Mock Test 1 to Premium Series',
      icon: Layers,
      color: 'bg-orange-100 text-orange-600',
      border: 'border-orange-200',
      href: '/admin/test-series',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Admin App Flow & Architecture Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How The Platform Works: Fast Flow & Full Exam Hierarchy
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            You can run simple tests directly or build full competitive exam packages. Choose what fits your objective.
          </p>
        </div>

        {/* QUICK FLOW CHOOSER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setSelectedFlow(selectedFlow === 'quick' ? 'both' : 'quick')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
              selectedFlow === 'quick' 
                ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-200' 
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <Zap className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Flow 1: Quick Tests (3 Steps)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Only Want to Conduct a Test?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              <strong>No Exam required.</strong> Create a Subject → Create Test → Add Questions → Publish. Students can immediately find and take it from their Available Tests panel.
            </p>
            <div className="mt-3 text-xs font-semibold text-amber-700 flex items-center gap-1">
              {selectedFlow === 'quick' ? 'Viewing Fast Flow only (Click to show all)' : 'Click to filter to Fast Flow →'}
            </div>
          </div>

          <div 
            onClick={() => setSelectedFlow(selectedFlow === 'full' ? 'both' : 'full')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
              selectedFlow === 'full' 
                ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-200' 
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                <FolderTree className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Flow 2: Full Hierarchy (6 Steps)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Building Exams & Test Series Packages?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              <strong>Complete enterprise structure.</strong> Category → Exam → Subjects → Tests → Questions → Bundled Test Series (for paid courses and multi-test subscriptions).
            </p>
            <div className="mt-3 text-xs font-semibold text-indigo-700 flex items-center gap-1">
              {selectedFlow === 'full' ? 'Viewing Full Hierarchy only (Click to show all)' : 'Click to filter to Full Hierarchy →'}
            </div>
          </div>
        </div>

        {/* FLOW 1: QUICK TEST FLOW */}
        {(selectedFlow === 'both' || selectedFlow === 'quick') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Flow 1: Fast Standalone Test Flow
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Exams NOT Required
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Create & Launch a Test in 3 Simple Steps
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Ideal when an admin wants to quickly create a quiz or mock test without managing complex exam categories.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href="/admin/tests"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Go to Tests
                </Link>
              </div>
            </div>

            {/* 3 FAST STEPS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                      1
                    </span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Pick or Add Subject</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A test requires a Subject (e.g. <em>Physics</em>, <em>General Studies</em>, <em>Math</em>). If it already exists in your list, you are ready for step 2!
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-amber-200/60">
                  <Link
                    href="/admin/subjects"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950"
                  >
                    Manage Subjects <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                      2
                    </span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Creation
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Create Test & Publish</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Go to <strong>Tests → + Create Test</strong>. Fill in title, duration (mins), total & passing marks, and make sure <strong>Publish</strong> and <strong>Active</strong> are checked!
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-amber-200/60">
                  <Link
                    href="/admin/tests"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950"
                  >
                    Create Test <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                      3
                    </span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Content
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Add Questions</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Add MCQs with correct answers and options. You can draft new questions directly, select existing questions from Question Bank, or upload via Excel.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-amber-200/60">
                  <Link
                    href="/admin/questions"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950"
                  >
                    Question Bank <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* FAST FLOW USER PANEL VERIFICATION BANNER */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Student Panel Status: 100% Fully Functional!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Students will see this test under <strong>Available Tests</strong> (<code className="bg-emerald-100 px-1 py-0.5 rounded">/dashboard/tests</code>) and their main <strong>Dashboard</strong>. 
                    They can click "Start Test", answer questions, submit, and see detailed scorecards and explanations without any Exam entity.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FLOW 2: FULL EXAM & TEST SERIES ARCHITECTURE */}
        {(selectedFlow === 'both' || selectedFlow === 'full') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-indigo-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    <FolderTree className="w-3.5 h-3.5" /> Flow 2: Complete Exam & Test Series Package Flow
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Original Architecture
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Full Multi-Tier Exam & Test Series Hierarchy
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Use this when organizing complex competitive exam preparations (like CGPSC, JEE, NEET) with multi-subject packages, paid access, and test bundles.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href="/admin/test-series"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <ListPlus className="w-4 h-4" /> Go to Series
                </Link>
              </div>
            </div>

            {/* GOLDEN RULE OF CREATION (PRESERVED FROM ORIGINAL FLOW) */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-amber-800 font-bold text-base mb-1">Golden Rule of Creation (Full Hierarchy)</h3>
                <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                  You must always create the <strong>parent data first</strong>, then the data that depends on it. 
                  For example, you cannot create a Test without a Subject, or a Test Series without a Category, because the database requires those IDs.
                </p>
              </div>
            </div>

            {/* FULL 6 STEPS (PRESERVED FROM ORIGINAL FLOW WITH ENHANCED LINKS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fullSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.id} 
                    className={`bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between ${step.border}`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon className="w-24 h-24" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className={`p-2.5 rounded-xl ${step.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {step.id}</span>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">{step.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-xs mb-3 relative z-10 leading-relaxed min-h-[36px]">
                        {step.description}
                      </p>
                      
                      <div className="bg-slate-50 rounded p-2.5 border border-slate-100 relative z-10 mb-3">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">Example:</span>
                        <span className="text-xs font-medium text-slate-800">{step.example}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 relative z-10 flex items-center justify-between">
                      <Link 
                        href={step.href} 
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        Open {step.title.split(' ')[0]} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DATA DEPENDENCY CHAIN DIAGRAM (PRESERVED FROM ORIGINAL FLOW) */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 text-center">Full Data Dependency Chain</h3>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center text-xs font-medium">
                <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-lg shadow-sm w-full md:w-auto">
                  1. Category & Subject
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 md:hidden my-0.5" />
                
                <div className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg shadow-sm w-full md:w-auto border-dashed">
                  2. Exam (Optional Group)
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 md:hidden my-0.5" />
                
                <div className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2.5 rounded-lg shadow-sm w-full md:w-auto">
                  3 & 4. Test & Questions
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 md:hidden my-0.5" />
                
                <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-lg shadow-sm w-full md:w-auto">
                  5 & 6. Test Series Package
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: COMPARISON TABLE (FAST TEST vs FULL EXAM HIERARCHY) */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Side-by-Side Comparison: Flow 1 vs Flow 2</h3>
            <p className="text-xs text-slate-500">
              Clear breakdown of requirements and user panel outcomes for both paths.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Feature / Requirement</th>
                  <th className="py-3 px-4 text-amber-700">⚡ Flow 1: Fast Standalone Test</th>
                  <th className="py-3 px-4 text-indigo-700">🏛️ Flow 2: Full Exam Hierarchy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Required Entities</td>
                  <td className="py-3 px-4 text-slate-700"><strong>Subject</strong> only (Tests link to Subject)</td>
                  <td className="py-3 px-4 text-slate-700"><strong>Category, Exam, Subject, Test Series</strong></td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Total Steps</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">3 Steps (~2 mins)</td>
                  <td className="py-3 px-4 text-slate-700">6 Steps (~10 mins)</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Student Available Tests Tab</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Shows immediately</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Shows immediately</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Student Dashboard Feed</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Shows immediately</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Shows immediately</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Student Test Taking Engine</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Full test engine, timer, auto-submit</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Full test engine, timer, auto-submit</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Results & Analytics</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Instant scorecards & analytics</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Instant scorecards & analytics</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Student "My Exams" Page</td>
                  <td className="py-3 px-4 text-slate-500">Not listed (students use Available Tests)</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Listed under Exam card</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Student "My Test Series" Page</td>
                  <td className="py-3 px-4 text-slate-500">Not bundled into series</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">✓ Listed inside Test Series package</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Best For</td>
                  <td className="py-3 px-4 text-slate-700">Quick quizzes, daily mock tests, practice tests</td>
                  <td className="py-3 px-4 text-slate-700">Full syllabus packs, paid enrollments, competitive exams</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: STUDENT PANEL MATRIX & VERIFICATION */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-900">Detailed Student Panel Page Verification</h3>
          </div>
          <p className="text-xs text-slate-500">
            Exact verification of how the student panel routes respond to tests without an Exam:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">Available Tests (`/dashboard/tests`)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">100% Works</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Queries published tests directly from the database. Displays test cards under All Tests, Newly Published, and Free Practice.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">Test Taking Engine (`/dashboard/tests/[id]`)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">100% Works</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Loads questions and options using `test_id`. Records attempt start, answers, timers, question navigation, and submission.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">Results & Performance (`/dashboard/results`)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">100% Works</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Calculates total marks, percentage, correct/wrong questions, subject breakdown, and updates overall student performance.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 text-sm">My Exams (`/dashboard/exams`)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Optional Tab</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Only lists exams if you create one in Flow 2. If no exam exists, it shows "No exams found". <em>Students do not need this tab to take tests!</em>
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">Ready to take action?</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Create a quick test right away, or build a complete exam series bundle.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/tests"
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" /> Quick Test (Flow 1)
            </Link>
            <Link
              href="/admin/test-series"
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <FolderTree className="w-4 h-4" /> Exam Series (Flow 2)
            </Link>
            <Link
              href="/guide"
              target="_blank"
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Open Full Manual
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
