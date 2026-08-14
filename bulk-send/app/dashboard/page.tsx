import Link from "next/link";
import { mockCampaigns, Campaign, CampaignStatus } from "@/data/mockCampaigns";

const statusStyles: Record<CampaignStatus, { label: string; className: string }> = {
  sent: { label: "Sent", className: "bg-teal-50 text-teal-700 border border-teal-200" },
  sending: { label: "Sending…", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border border-slate-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-600 border border-red-200" },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const s = statusStyles[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {status === "sending" && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5" />
      )}
      {s.label}
    </span>
  );
}

export default function DashboardPage() {
  const stats = [
    { label: "Total Campaigns", value: mockCampaigns.length },
    { label: "Emails Sent", value: mockCampaigns.filter(c => c.status === "sent" || c.status === "sending").reduce((a, c) => a + c.recipients, 0).toLocaleString() },
    { label: "Avg. Open Rate", value: "74%" },
    { label: "Recipients", value: "831" },
  ];

  return (
    <div className="flex flex-col flex-1 px-6 py-8 md:px-10 mt-14 md:mt-0 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">All your email campaigns in one place.</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Campaigns</h2>
          <span className="text-xs text-slate-400">{mockCampaigns.length} campaigns</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Open Rate</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockCampaigns.map((campaign: Campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">{campaign.subject}</td>
                  <td className="px-6 py-4 text-slate-600">{campaign.recipients.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={campaign.status} /></td>
                  <td className="px-6 py-4 text-slate-500">{campaign.sentDate}</td>
                  <td className="px-6 py-4">
                    {campaign.openRate > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${campaign.openRate}%` }} />
                        </div>
                        <span className="text-slate-600">{campaign.openRate}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/status/${campaign.id}`}
                      className="text-xs font-medium text-teal-600 hover:text-teal-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
