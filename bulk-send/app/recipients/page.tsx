"use client";

import { useState } from "react";
import { mockRecipients, Recipient } from "@/data/mockRecipients";

const TAGS = ["All", "vip", "newsletter", "trial"];

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>(mockRecipients);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTagInput, setNewTagInput] = useState("newsletter");
  const [newCustomField, setNewCustomField] = useState("");

  const filtered = recipients.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === "All" || r.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleDeleteSelected = () => {
    setRecipients((prev) => prev.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const tagsArray = newTagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newRec: Recipient = {
      id: "rec_" + Date.now(),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      tags: tagsArray.length > 0 ? tagsArray : ["newsletter"],
      customField: newCustomField.trim() || undefined,
    };

    setRecipients((prev) => [newRec, ...prev]);

    // Reset form
    setNewName("");
    setNewEmail("");
    setNewTagInput("newsletter");
    setNewCustomField("");
    setShowAddModal(false);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length <= 1) return; // empty or header only

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = header.indexOf("name");
      const emailIdx = header.indexOf("email");

      if (emailIdx === -1) {
        alert("CSV must contain an 'email' column.");
        return;
      }

      const imported: Recipient[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        const email = cols[emailIdx];
        if (!email || !email.includes("@")) continue;

        const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : email.split("@")[0];
        imported.push({
          id: "rec_" + Date.now() + "_" + i,
          name,
          email,
          tags: ["imported"],
        });
      }

      if (imported.length > 0) {
        setRecipients((prev) => [...imported, ...prev]);
        alert(`Successfully imported ${imported.length} recipients!`);
        setShowAddModal(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col flex-1 px-6 py-8 md:px-10 mt-14 md:mt-0 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recipients</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your contacts and segments.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Recipient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeTag === tag
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700 font-medium">
          <span>{selected.size} selected</span>
          <button
            onClick={handleDeleteSelected}
            className="ml-auto text-red-500 hover:text-red-700 transition-colors text-xs font-semibold"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Custom Field</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r: Recipient) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.customField || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setRecipients((prev) => prev.filter((item) => item.id !== r.id))}
                      className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No recipients found. Click &quot;Add Recipient&quot; to add your first contact.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Recipient</h2>
                <p className="text-xs text-slate-500 mt-0.5">Add a contact manually or import via CSV.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* CSV Import Shortcut */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-2 font-medium">Have a contact list CSV file?</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-sm">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Import CSV File
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>
            </div>

            <div className="relative my-4 flex items-center">
              <div className="flex-1 border-t border-slate-100" />
              <span className="mx-3 text-xs text-slate-400 font-medium uppercase">Or Add Manually</span>
              <div className="flex-1 border-t border-slate-100" />
            </div>

            <form onSubmit={handleAddRecipient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohamed Ali"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mohamed@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. vip, newsletter, customer"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Field (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise / Company Name"
                  value={newCustomField}
                  onChange={(e) => setNewCustomField(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition shadow-sm shadow-teal-200"
                >
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
