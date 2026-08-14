# 🎨 BulkSend Web Client

This directory contains the Next.js 15 frontend web interface for **BulkSend**, a personal mailer and email campaign management dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Key Pages & Views

- `/dashboard` ([app/dashboard/page.tsx](file:///c:/xampp/htdocs/bluksend/bulk-send/app/dashboard/page.tsx)): Overview stats, active campaigns list, open rate metrics, and quick actions.
- `/campaigns/new` ([app/campaigns/new/page.tsx](file:///c:/xampp/htdocs/bluksend/bulk-send/app/campaigns/new/page.tsx)): Composer for creation of personalized campaigns with merge tag support.
- `/recipients` ([app/recipients/page.tsx](file:///c:/xampp/htdocs/bluksend/bulk-send/app/recipients/page.tsx)): Recipient table with search, tagging, custom fields, and CSV file upload modal.
- `/settings` ([app/settings/page.tsx](file:///c:/xampp/htdocs/bluksend/bulk-send/app/settings/page.tsx)): SMTP host, port, credentials configuration, and connection test buttons.
- `/status/[campaignId]` ([app/status/[campaignId]/page.tsx](file:///c:/xampp/htdocs/bluksend/bulk-send/app/status/[campaignId]/page.tsx)): Realtime telemetry progress monitor for active sending queues.

## 🛠️ Build & Production

To build the application for production:

```bash
npm run build
npm run start
```
