'use client';

import { useEffect, useState } from 'react';
import type { UsageStats, OLVVerificationRecord } from '@/lib/olv/types';

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [history, setHistory] = useState<OLVVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/olv/usage').then(r => r.json()),
      fetch('/api/olv/history').then(r => r.json())
    ]).then(([usageData, historyData]) => {
      if (usageData.success) setUsage(usageData.data);
      if (historyData.success) setHistory(historyData.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8">Loading usage data...</div>;
  }

  const usagePercent = usage ? (usage.used / usage.limit) * 100 : 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-body">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Usage & History</h1>
        <p className="text-gray-600 mt-1">Track your verification limits and past activity.</p>
      </div>

      {/* Usage Card */}
      {usage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Plan: {usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)}</h3>
              <p className="text-sm text-gray-500">Billing cycle: {usage.month}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-[var(--color-accent)]">{usage.used}</span>
              <span className="text-gray-500"> / {usage.limit} used</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-yellow-400' : 'bg-teal-500'}`}
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{usage.remaining} verifications remaining this month.</p>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Verification History</h3>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No verifications performed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium border-b border-gray-200">Date</th>
                  <th className="px-6 py-3 font-medium border-b border-gray-200">Candidate Ref</th>
                  <th className="px-6 py-3 font-medium border-b border-gray-200">Result</th>
                  <th className="px-6 py-3 font-medium border-b border-gray-200">Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {record.candidateRef}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.riskLevel === 'low_risk' ? 'bg-green-100 text-green-800' :
                        record.riskLevel === 'review_recommended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.riskLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.riskScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
