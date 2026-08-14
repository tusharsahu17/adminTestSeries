'use client';
import { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Loader2, Settings2, Trophy, Medal, Award, EyeOff } from 'lucide-react';

export default function LeaderboardsPage() {
  const [overall, setOverall] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    is_enabled: true,
    names_visible: true,
    ranks_public: true,
    scores_public: true
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        const [overallRes, settingsRes] = await Promise.all([
          adminService.getOverallLeaderboard().catch(() => ({ data: [] })),
          adminService.getLeaderboardSettings().catch(() => ({ data: {} }))
        ]);
        
        const lbData = overallRes.data?.leaderboard || overallRes.data || [];
        setOverall(Array.isArray(lbData) ? lbData : []);
        
        const setReq = settingsRes.data?.settings || settingsRes.data;
        if (setReq && Object.keys(setReq).length > 0) {
          setSettings(setReq);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, []);

  const handleSettingsChange = (field: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await adminService.updateLeaderboardSettings(settings);
      alert('Leaderboard settings updated successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard Management</h1>
          <p className="text-sm text-gray-500">Configure global leaderboard settings and view top performers.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 text-indigo-600">
              <Settings2 className="w-5 h-5" />
              <h2 className="text-lg font-bold text-gray-900">Visibility Settings</h2>
            </div>
            
            <div className="space-y-5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Enable Leaderboard</p>
                  <p className="text-xs text-gray-500">Turn global leaderboard on or off</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={settings.is_enabled} onChange={() => handleSettingsChange('is_enabled')} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${settings.is_enabled ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.is_enabled ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Show Real Names</p>
                  <p className="text-xs text-gray-500">If disabled, usernames are anonymized</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={settings.names_visible} onChange={() => handleSettingsChange('names_visible')} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${settings.names_visible ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.names_visible ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Public Ranks</p>
                  <p className="text-xs text-gray-500">Allow students to see others' ranks</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={settings.ranks_public} onChange={() => handleSettingsChange('ranks_public')} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${settings.ranks_public ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.ranks_public ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Public Scores</p>
                  <p className="text-xs text-gray-500">Allow students to see others' scores</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={settings.scores_public} onChange={() => handleSettingsChange('scores_public')} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${settings.scores_public ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.scores_public ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            <button 
              onClick={saveSettings}
              disabled={savingSettings}
              className="mt-8 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-500">
                <Trophy className="w-5 h-5" />
                <h3 className="font-bold text-gray-900">Overall Global Leaderboard</h3>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">Overall</button>
                <button className="text-xs font-medium px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors">Weekly</button>
                <button className="text-xs font-medium px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors">Monthly</button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              {!settings.is_enabled ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
                  <EyeOff className="w-12 h-12 text-gray-300 mb-4" />
                  <p>Leaderboard is currently disabled.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                      <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tests Taken</th>
                      <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                        </td>
                      </tr>
                    ) : overall.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-500">No leaderboard data available.</td>
                      </tr>
                    ) : (
                      overall.slice(0, 10).map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-3 px-5">
                            {idx === 0 ? <Medal className="w-6 h-6 text-yellow-500" /> :
                             idx === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                             idx === 2 ? <Medal className="w-6 h-6 text-amber-700" /> :
                             <span className="font-bold text-gray-500 pl-1">#{idx + 1}</span>}
                          </td>
                          <td className="py-3 px-5 font-medium text-gray-900">
                            {settings.names_visible ? entry.user?.name || entry.username || `User ${entry.user_id}` : `Student_${entry.user_id.toString().substring(0,4)}`}
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600">{entry.tests_taken || 0}</td>
                          <td className="py-3 px-5 text-right font-bold text-indigo-600">
                            {settings.scores_public ? entry.total_score || entry.score || 0 : 'Hidden'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
