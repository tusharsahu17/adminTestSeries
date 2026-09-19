import React from 'react';
import { ArrowRight, Layers, BookOpen, FileText, CheckSquare, ListPlus, AlertTriangle } from 'lucide-react';

export default function FlowPage() {
  const steps = [
    {
      id: 1,
      title: 'Category & Subject',
      description: 'The foundation of everything. Create basic building blocks first.',
      example: 'Category: Engineering | Subject: Physics',
      icon: Layers,
      color: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
    },
    {
      id: 2,
      title: 'Exam (Optional)',
      description: 'Optional grouping for subjects.',
      example: 'JEE Mains -> links to Physics & Math',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-600',
      border: 'border-indigo-200',
    },
    {
      id: 3,
      title: 'Test',
      description: 'Create a test under a specific subject.',
      example: 'Physics Mock Test 1 (under Physics)',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      border: 'border-purple-200',
    },
    {
      id: 4,
      title: 'Questions & Options',
      description: 'Add multiple choice questions to a specific Test using its ID.',
      example: 'Q1: What is velocity? + 4 Options',
      icon: CheckSquare,
      color: 'bg-pink-100 text-pink-600',
      border: 'border-pink-200',
    },
    {
      id: 5,
      title: 'Test Series',
      description: 'Create a test series under a Category.',
      example: 'JEE Mains Premium Test Series',
      icon: ListPlus,
      color: 'bg-rose-100 text-rose-600',
      border: 'border-rose-200',
    },
    {
      id: 6,
      title: 'Link Tests to Series',
      description: 'Finally, select tests and add them to the Test Series in a specific order.',
      example: 'Add Physics Mock Test 1 to Premium Series',
      icon: Layers,
      color: 'bg-orange-100 text-orange-600',
      border: 'border-orange-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Admin Flow Guide
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            A visual guide to understanding how data is structured and the exact order it should be created.
          </p>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg mb-12 shadow-sm flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-bold text-lg mb-1">Golden Rule of Creation</h3>
            <p className="text-amber-700 text-sm">
              You must always create the <strong>parent data first</strong>, then the data that depends on it. 
              For example, you cannot create a Test without a Subject, or a Test Series without a Category, because the database requires those IDs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow relative overflow-hidden group ${step.border}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon className="w-24 h-24" />
                </div>
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className={`p-3 rounded-xl ${step.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Step {step.id}</span>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{step.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 relative z-10 h-10">
                  {step.description}
                </p>
                
                <div className="bg-gray-50 rounded p-3 border border-gray-100 relative z-10">
                  <span className="text-xs font-semibold text-gray-500 block mb-1">Example:</span>
                  <span className="text-sm font-medium text-gray-800">{step.example}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Data Dependency Chain</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
            <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg font-medium shadow-sm w-full md:w-auto">
              Category & Subject
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90 md:hidden my-1" />
            
            <div className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg font-medium shadow-sm w-full md:w-auto border-dashed">
              Exam (Optional)
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90 md:hidden my-1" />
            
            <div className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg font-medium shadow-sm w-full md:w-auto">
              Test & Questions
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90 md:hidden my-1" />
            
            <div className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg font-medium shadow-sm w-full md:w-auto">
              Test Series
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
