"use client";

import { useState } from "react";
import { mockRecipients, Recipient } from "@/data/mockRecipients";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  
  // Recipient state
  const [recipientList, setRecipientList] = useState<Recipient[]>(mockRecipients);
  const [selected, setSelected] = useState<Set<string>>(new Set(mockRecipients.map((r) => r.id)));
  const [showConfirm, setShowConfirm] = useState(false);

  // Manual Email Input state
  const [manualInput, setManualInput] = useState("");

  const filtered = recipientList.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRecipient = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddManualEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = manualInput.trim();
    if (!raw) return;

    // Support multiple comma/space separated emails
    const emails = raw
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.includes("@"));

    if (emails.length === 0) return;

    const newRecs: Recipient[] = [];
    const newSelected = new Set(selected);

    emails.forEach((emailStr) => {
      const email = emailStr.toLowerCase();
      // Check if already exists in list
      const existing = recipientList.find((r) => r.email === email);
      if (existing) {
        newSelected.add(existing.id);
      } else {
        const namePart = email.split("@")[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const newRec: Recipient = {
          id: "rec_manual_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          name: formattedName,
          email: email,
          tags: ["manual"],
        };
        newRecs.push(newRec);
        newSelected.add(newRec.id);
      }
    });

    if (newRecs.length > 0) {
      setRecipientList((prev) => [...newRecs, ...prev]);
    }
    setSelected(newSelected);
    setManualInput("");
  };

  const canSend = subject.trim() && body.trim() && selected.size > 0;

  return (
    <div className="flex flex-col flex-1 px-6 py-8 md:px-10 mt-14 md:mt-0 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">New Campaign</h1>
        <p className="text-sm text-slate-500 mt-0.5">Each recipient receives their own personal email.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left: Compose */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message Body</label>
              {/* Rich text toolbar */}
              <div className="flex gap-1 flex-wrap mb-2 p-2 bg-slate-50 rounded-t-xl border border-b-0 border-slate-200">
                {["B", "I", "U", "S"].map((f) => (
                  <button key={f} className="w-7 h-7 rounded text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center">
                    {f}
                  </button>
                ))}
                <div className="w-px h-5 bg-slate-200 self-center mx-1" />
                {["• List", "1. List", "Link"].map((f) => (
                  <button key={f} className="px-2 h-7 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                    {f}
                  </button>
                ))}
                <div className="ml-auto">
                  <span className="text-xs text-slate-400 italic">Use {"{{first_name}}"} for personalization</span>
                </div>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder={`Hi {{first_name}},\n\nWrite your message here…`}
                className="w-full px-4 py-3 rounded-b-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition resize-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right: Recipients */}
        <div className="w-full lg:w-80 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">Select Recipients</h2>
              <span className="text-xs text-teal-600 font-semibold">{selected.size} selected</span>
            </div>

            {/* Manual Email Add Form */}
            <form onSubmit={handleAddManualEmail} className="flex gap-2">
              <input
                type="text"
                placeholder="Add email manually…"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </form>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search recipients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition"
              />
            </div>

            {/* CSV Upload */}
            <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs hover:border-teal-400 hover:text-teal-600 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Upload CSV
              <input type="file" accept=".csv" className="hidden" />
            </label>

            {/* Recipient list */}
            <div className="flex flex-col gap-1 overflow-y-auto max-h-64">
              {filtered.map((r) => (
                <label key={r.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${selected.has(r.id) ? "bg-teal-50 border border-teal-200" : "hover:bg-slate-50 border border-transparent"}`}>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleRecipient(r.id)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400 truncate">{r.email}</p>
                  </div>
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No matching recipients.</p>
              )}
            </div>
          </div>

          {/* Send button */}
          <button
            disabled={!canSend}
            onClick={() => setShowConfirm(true)}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
              canSend
                ? "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Send Individually →
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Send</h2>
            <p className="text-sm text-slate-500 mb-6">
              You&apos;re about to send <strong className="text-slate-800">{selected.size} individual emails</strong>.
              Each recipient will receive their own personal copy.
            </p>
            <div className="flex flex-col gap-2 mb-6 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Recipients</span>
                <span className="font-semibold text-slate-800">{selected.size}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Est. send time</span>
                <span className="font-semibold text-slate-800">~{Math.ceil(selected.size * 0.5)}s</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Send type</span>
                <span className="font-semibold text-teal-700">Personal (1:1)</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); router.push("/status/c1"); }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
