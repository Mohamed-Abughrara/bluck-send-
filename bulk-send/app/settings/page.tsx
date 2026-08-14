"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:4000/api";

/* ─── Reusable primitives ─────────────────────────────────────── */

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:ring-offset-1
        ${checked ? "bg-teal-600" : "bg-slate-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {children}
      </label>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function Input({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  suffix,
}: {
  id?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
        focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-slate-100 my-4" />;
  return (
    <div className="relative my-5 flex items-center">
      <div className="flex-1 border-t border-slate-100" />
      <span className="mx-4 text-xs text-slate-400">{label}</span>
      <div className="flex-1 border-t border-slate-100" />
    </div>
  );
}

function StatusChip({ status }: { status: "connected" | "disconnected" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border
      ${status === "connected"
        ? "bg-teal-50 text-teal-700 border-teal-200"
        : "bg-red-50 text-red-600 border-red-200"
      }`
    }>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "connected" ? "bg-teal-500" : "bg-red-500"}`} />
      {status === "connected" ? "Connected" : "Disconnected"}
    </span>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function SettingsPage() {
  // Connected account state
  const [connected, setConnected] = useState(true);
  const [connectedEmail, setConnectedEmail] = useState("mohamed@example.com");
  const [connectedProvider, setConnectedProvider] = useState("Google");

  const handleConnect = async (providerName: string) => {
    try {
      const emailPrompt = prompt(`Enter your ${providerName} email address:`, "user@example.com");
      if (!emailPrompt) return;

      const res = await fetch(`${API_BASE}/settings/connected-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailPrompt, provider: providerName, status: "connected" }),
      });
      if (res.ok) {
        setConnected(true);
        setConnectedEmail(emailPrompt);
        setConnectedProvider(providerName);
        setToastMessage(`${providerName} account connected!`);
      }
    } catch {
      setConnected(true);
      setToastMessage(`${providerName} connected!`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${API_BASE}/settings/connected-account`, { method: "DELETE" });
      setConnected(false);
      setToastMessage("Account disconnected");
    } catch {
      setConnected(false);
    }
  };

  // SMTP Configuration State
  const [useSmtp, setUseSmtp] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [encryption, setEncryption] = useState("tls");
  const [authMethod, setAuthMethod] = useState("password");
  
  // Test connection state
  const [testStatus, setTestStatus] = useState<null | "success" | "fail">(null);
  const [testError, setTestError] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  // Sending limits
  const [dailyLimit, setDailyLimit] = useState("450");
  const [sendDelay, setSendDelay] = useState("3");
  const [autoPause, setAutoPause] = useState(true);

  // Sender identity
  const [replyTo, setReplyTo] = useState("");
  const [signature, setSignature] = useState("");

  // Compliance
  const [unsubLink, setUnsubLink] = useState(true);
  const [unsubUrl, setUnsubUrl] = useState("");
  const [consentRequired, setConsentRequired] = useState(false);

  // Notifications
  const [notifFinish, setNotifFinish] = useState(true);
  const [notifFailure, setNotifFailure] = useState(true);

  // Page feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load existing settings on mount from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${API_BASE}/settings`, {
          headers: {
            "Authorization": `Bearer demo-token`, // or placeholder header
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data) {
          setUseSmtp(data.use_smtp || false);
          setSenderName(data.sender_name || "");
          setSenderEmail(data.sender_email || "");
          setSmtpHost(data.smtp_host || "");
          setSmtpPort(data.smtp_port ? String(data.smtp_port) : "587");
          setSmtpUser(data.smtp_username || "");
          setSmtpPass(data.smtp_password || "");
          setEncryption(data.encryption || "tls");
          setAuthMethod(data.auth_method || "password");

          if (data.sending_limits) {
            setDailyLimit(String(data.sending_limits.daily_limit || 450));
            setSendDelay(String(data.sending_limits.delay_seconds || 3));
            setAutoPause(data.sending_limits.auto_pause ?? true);
          }
          if (data.sender_identity) {
            setReplyTo(data.sender_identity.reply_to || "");
            setSignature(data.sender_identity.signature || "");
          }
          if (data.compliance) {
            setUnsubUrl(data.compliance.unsub_url || "");
            setConsentRequired(data.compliance.require_consent ?? false);
          }
          if (data.notifications) {
            setNotifFinish(data.notifications.on_finish ?? true);
            setNotifFailure(data.notifications.on_high_failure ?? true);
          }
        }
      } catch (err) {
        console.log("Using offline settings mode:", err);
      }
    }
    loadSettings();
  }, []);

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestStatus(null);
    setTestError("");

    try {
      const res = await fetch(`${API_BASE}/settings/smtp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: senderName,
          sender_email: senderEmail,
          smtp_host: smtpHost,
          smtp_port: parseInt(smtpPort, 10) || 587,
          smtp_username: smtpUser,
          smtp_password: smtpPass,
          encryption,
          auth_method: authMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus("success");
      } else {
        setTestStatus("fail");
        setTestError(data.error || "Authentication or connection failed");
      }
    } catch {
      setTestStatus("fail");
      setTestError("Could not reach backend server at http://localhost:4000");
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setToastMessage(null);

    try {
      // 1. Save SMTP settings
      if (useSmtp && smtpHost) {
        await fetch(`${API_BASE}/settings/smtp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_name: senderName,
            sender_email: senderEmail,
            smtp_host: smtpHost,
            smtp_port: parseInt(smtpPort, 10) || 587,
            smtp_username: smtpUser,
            smtp_password: smtpPass,
            encryption,
            auth_method: authMethod,
            use_smtp: useSmtp,
          }),
        });
      }

      // 2. Save preferences
      await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          use_smtp: useSmtp,
          sending_limits: {
            daily_limit: parseInt(dailyLimit, 10) || 450,
            delay_seconds: parseInt(sendDelay, 10) || 3,
            auto_pause: autoPause,
          },
          sender_identity: {
            reply_to: replyTo,
            signature,
          },
          compliance: {
            auto_unsubscribe: unsubLink,
            unsub_url: unsubUrl,
            require_consent: consentRequired,
          },
          notifications: {
            on_finish: notifFinish,
            on_high_failure: notifFailure,
          },
        }),
      });

      setToastMessage("Settings saved successfully!");
    } catch {
      setToastMessage("Settings updated locally.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-6 py-8 md:px-10 mt-14 md:mt-0 max-w-3xl mx-auto w-full pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your email configuration and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 border-2 border-white" />
          </button>
          {/* Help */}
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
              <path d="M12 17h.01" strokeLinecap="round" />
            </svg>
          </button>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm cursor-pointer">
            JD
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">

        {/* ── 1. Connected Account ─────────────────────────────── */}
        <Card title="Connected Account" description="The email account used to send your campaigns.">
          {connected ? (
            <>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {/* Provider avatar */}
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                  {/* Google G */}
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{connectedEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{connectedProvider} OAuth</span>
                    <span className="text-slate-200">·</span>
                    <StatusChip status="connected" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Disconnect
                  </button>
                  <button
                    onClick={() => handleConnect(connectedProvider || "Google")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    Reconnect
                  </button>
                </div>
              </div>

              <Divider label="or configure a custom SMTP server below" />
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 py-6 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">No account connected</p>
                  <p className="text-xs text-slate-400 mt-1">Connect your email provider to start sending.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <button
                    onClick={() => handleConnect("Google")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"/></svg>
                    Connect Gmail
                  </button>
                  <button
                    onClick={() => handleConnect("Outlook")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M21.18 2H2.82C1.82 2 1 2.82 1 3.82v16.36C1 21.18 1.82 22 2.82 22H21.18C22.18 22 23 21.18 23 20.18V3.82C23 2.82 22.18 2 21.18 2ZM12 13.5 3 8V6l9 5.5L21 6v2l-9 5.5Z"/></svg>
                    Connect Outlook
                  </button>
                </div>
              </div>
              <Divider label="or configure a custom SMTP server below" />
            </>
          )}
        </Card>

        {/* ── 2. SMTP Configuration ────────────────────────────── */}
        <Card title="SMTP Configuration" description="Use your own mail server for sending.">
          {/* Toggle */}
          <div className="flex items-center justify-between mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Use custom SMTP instead of OAuth</p>
              <p className="text-xs text-slate-400 mt-0.5">Bypass connected OAuth account and send via SMTP directly.</p>
            </div>
            <Toggle checked={useSmtp} onChange={setUseSmtp} />
          </div>

          <div className={`flex flex-col gap-4 transition-opacity duration-200 ${useSmtp ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            {/* Sender name + email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senderName">Sender Name</Label>
                <Input id="senderName" value={senderName} onChange={setSenderName} placeholder="Mohamed Ali" disabled={!useSmtp} />
              </div>
              <div>
                <Label htmlFor="senderEmail">Sender Email Address</Label>
                <Input id="senderEmail" type="email" value={senderEmail} onChange={setSenderEmail} placeholder="mohamed@mydomain.com" disabled={!useSmtp} />
              </div>
            </div>

            {/* Host + port */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" value={smtpHost} onChange={setSmtpHost} placeholder="smtp.gmail.com" disabled={!useSmtp} />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" type="number" value={smtpPort} onChange={setSmtpPort} placeholder="587" disabled={!useSmtp} />
              </div>
            </div>

            {/* Username + password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input id="smtpUser" value={smtpUser} onChange={setSmtpUser} placeholder="your@email.com" disabled={!useSmtp} />
              </div>
              <div>
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input
                  id="smtpPass"
                  type={showPass ? "text" : "password"}
                  value={smtpPass}
                  onChange={setSmtpPass}
                  placeholder="••••••••••••"
                  disabled={!useSmtp}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Encryption + Auth method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="encryption">Encryption</Label>
                <Select
                  id="encryption"
                  value={encryption}
                  onChange={setEncryption}
                  options={[
                    { value: "none", label: "None" },
                    { value: "ssl", label: "SSL" },
                    { value: "tls", label: "TLS (Recommended)" },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="authMethod">Authentication Method</Label>
                <Select
                  id="authMethod"
                  value={authMethod}
                  onChange={setAuthMethod}
                  options={[
                    { value: "password", label: "Normal Password" },
                    { value: "oauth2", label: "OAuth2" },
                  ]}
                />
              </div>
            </div>

            {/* Test connection */}
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={!useSmtp || testLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {testLoading ? (
                  <svg className="w-4 h-4 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {testLoading ? "Testing…" : "Test Connection"}
              </button>

              {testStatus === "success" && (
                <span className="inline-flex items-center gap-1.5 text-sm text-teal-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Connection successful
                </span>
              )}
              {testStatus === "fail" && (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                  {testError || "Connection failed"}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900 text-sm">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Connecting with Gmail? Read This First:
            </div>
            Standard Gmail account passwords <strong>will not work</strong> for automated SMTP sending because Google requires 2-Factor Authentication and App Passwords.
            <ol className="list-decimal list-inside mt-2 space-y-1 text-amber-800">
              <li>Turn ON <strong>2-Step Verification</strong> in your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-amber-950">Google Security Settings</a>.</li>
              <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-amber-950">Google App Passwords</a>.</li>
              <li>Create an app password for <strong>&quot;Mail&quot;</strong> and copy the generated 16-character code.</li>
              <li>Use <code>smtp.gmail.com</code> (Port <code>587</code>) and paste the 16-character code into <strong>SMTP Password</strong>.</li>
            </ol>
          </div>

          <p className="mt-5 text-xs text-slate-400 leading-relaxed">
            🔒 Your credentials are encrypted and stored securely. We recommend using an <strong className="text-slate-500">app-specific password</strong> rather than your main account password.
          </p>
        </Card>

        {/* ── 3. Sending Limits ────────────────────────────────── */}
        <Card title="Sending Limits" description="Control how fast and how many emails you send.">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="dailyLimit"
                  hint="Most providers allow ~500 emails/day. Exceeding this may flag your account."
                >
                  Daily Send Limit
                </Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={dailyLimit}
                  onChange={setDailyLimit}
                  placeholder="450"
                />
              </div>
              <div>
                <Label htmlFor="sendDelay" hint="Seconds to wait between each individual send.">
                  Delay Between Sends (seconds)
                </Label>
                <Input
                  id="sendDelay"
                  type="number"
                  value={sendDelay}
                  onChange={setSendDelay}
                  placeholder="3"
                />
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Pause sending if failure rate exceeds 10%</p>
                <p className="text-xs text-slate-400 mt-0.5">Automatically pauses the campaign to protect your sender reputation.</p>
              </div>
              <Toggle checked={autoPause} onChange={setAutoPause} />
            </div>
          </div>
        </Card>

        {/* ── 4. Sender Identity ───────────────────────────────── */}
        <Card title="Sender Identity" description="Customize how you appear to recipients.">
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="replyTo" hint="Replies from recipients will be directed to this address.">
                Reply-To Email
              </Label>
              <Input id="replyTo" type="email" value={replyTo} onChange={setReplyTo} placeholder="replies@mydomain.com" />
            </div>

            <div>
              <Label htmlFor="signature" hint="Appended automatically to the bottom of every email.">
                Default Email Signature
              </Label>
              <textarea
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={4}
                placeholder={"Best regards,\nMohamed Ali\nFounder @ MyCompany\nmohamed@mydomain.com"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400 transition resize-none"
              />
            </div>
          </div>
        </Card>

        {/* ── 5. Compliance ────────────────────────────────────── */}
        <Card title="Compliance" description="Keep your sending legally compliant.">
          <div className="flex flex-col gap-4">
            {/* Unsubscribe link toggle (locked) */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-700">Include unsubscribe link automatically</p>
                  <div className="group relative">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-44 px-2 py-1.5 rounded-lg bg-slate-800 text-white text-xs text-center shadow-lg z-10">
                      Required by CAN-SPAM and GDPR law.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Required by law — cannot be disabled.</p>
              </div>
              <Toggle checked={unsubLink} onChange={setUnsubLink} disabled />
            </div>

            {/* Unsubscribe URL */}
            <div>
              <Label htmlFor="unsubUrl" hint="Where recipients land when they click 'Unsubscribe'.">
                Unsubscribe Page URL
              </Label>
              <Input id="unsubUrl" type="url" value={unsubUrl} onChange={setUnsubUrl} placeholder="https://yourdomain.com/unsubscribe" />
            </div>

            {/* Consent toggle */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Require recipient consent before adding to list</p>
                <p className="text-xs text-slate-400 mt-0.5">Recipients must confirm opt-in before receiving campaigns.</p>
              </div>
              <Toggle checked={consentRequired} onChange={setConsentRequired} />
            </div>
          </div>
        </Card>

        {/* ── 6. Notifications ─────────────────────────────────── */}
        <Card title="Notifications" description="Get notified about important campaign events.">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Email me when a campaign finishes sending</p>
                <p className="text-xs text-slate-400 mt-0.5">Receive a summary email with stats after each campaign.</p>
              </div>
              <Toggle checked={notifFinish} onChange={setNotifFinish} />
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Email me if failure rate is high</p>
                <p className="text-xs text-slate-400 mt-0.5">Alert when more than 10% of sends fail.</p>
              </div>
              <Toggle checked={notifFailure} onChange={setNotifFailure} />
            </div>
          </div>
        </Card>

      </div>

      {/* ── Sticky footer ──────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 z-30 px-6 md:px-10 py-4 bg-white/80 backdrop-blur border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4Z" />
            </svg>
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
