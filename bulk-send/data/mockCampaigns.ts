export type CampaignStatus = "sent" | "sending" | "draft" | "failed" | "queued" | "paused";

export interface Campaign {
  id: string;
  subject: string;
  recipients: number;
  status: CampaignStatus;
  sentDate: string;
  openRate: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "c1",
    subject: "Q3 Product Update — What's New",
    recipients: 142,
    status: "sent",
    sentDate: "2026-08-12",
    openRate: 68,
  },
  {
    id: "c2",
    subject: "Exclusive Summer Offer for You",
    recipients: 89,
    status: "sent",
    sentDate: "2026-08-08",
    openRate: 74,
  },
  {
    id: "c3",
    subject: "Follow-up: Your Trial is Ending Soon",
    recipients: 34,
    status: "sending",
    sentDate: "2026-08-14",
    openRate: 0,
  },
  {
    id: "c4",
    subject: "Welcome to BulkSend — Getting Started",
    recipients: 200,
    status: "sent",
    sentDate: "2026-07-30",
    openRate: 81,
  },
  {
    id: "c5",
    subject: "Webinar Invite: Email Best Practices",
    recipients: 56,
    status: "failed",
    sentDate: "2026-07-25",
    openRate: 0,
  },
  {
    id: "c6",
    subject: "Monthly Newsletter — August Edition",
    recipients: 310,
    status: "draft",
    sentDate: "—",
    openRate: 0,
  },
];
