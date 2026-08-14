import { mockRecipients } from "@/data/mockRecipients";
import Link from "next/link";

type StatusType = "sent" | "sending" | "failed" | "pending";

const recipientStatuses: StatusType[] = [
  "sent", "sent", "sent", "sending", "failed", "sent", "pending", "sent",
];

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  sent: { label: "Sent", className: "bg-teal-50 text-teal-700 border border-teal-200" },
  sending: { label: "Sending…", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-600 border border-red-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600 border border-amber-200" },
};

export default function CampaignStatusPage() {
  const totalSent = recipientStatuses.filter((s) => s === "sent").length;
  const progress = Math.round((totalSent / recipientStatuses.length) * 100);

  const rows = mockRecipients.map((r, i) => ({
    ...r,
    status: recipientStatuses[i % recipientStatuses.length],
    deliveredAt: recipientStatuses[i % recipientStatuses.length] === "sent" ? "2026-08-14 22:05" : "—",
  }));

  return (
    <div className="flex flex-col flex-1 px-6 py-8 md:px-10 mt-14 md:mt-0 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaign Status</h1>
          <p className="text-sm text-slate-500 mt-0.5">Q3 Product Update — What&apos;s New</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        {[
          { label: "Total Recipients", value: rows.length },
          { label: "Sent", value: rows.filter(r => r.status === "sent").length },
          { label: "Failed", value: rows.filter(r => r.status === "failed").length },
          { label: "Pending", value: rows.filter(r => r.status === "pending" || r.status === "sending").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-700">Send Progress</span>
          <span className="text-sm font-bold text-teal-600">{progress}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">{totalSent} of {recipientStatuses.length} emails delivered</p>
      </div>

      {/* Per-recipient table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Per-Recipient Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const sc = statusConfig[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{r.name}</td>
                    <td className="px-6 py-4 text-slate-500">{r.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                        {r.status === "sending" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5" />}
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{r.deliveredAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
