# BulkSend API Documentation

Node.js + Express backend service for BulkSend using JSON file database.

## Base URL
`http://localhost:4000/api`

---

## 1. Health Check
- `GET /health` -> Check server status

## 2. Authentication (`/auth`)
- `POST /auth/register` -> Body: `{ "email": "user@example.com", "password": "password123" }`
- `POST /auth/login` -> Body: `{ "email": "user@example.com", "password": "password123" }` -> Returns `{ token, user }`
- `GET /auth/me` -> Headers: `Authorization: Bearer <token>`

## 3. Recipients (`/recipients`)
- `GET /recipients?page=1&limit=20` -> List paginated recipients for authenticated user
- `POST /recipients` -> Body: `{ "name": "John Doe", "email": "john@example.com", "tags": ["vip"], "custom_fields": { "company": "Acme" } }`
- `POST /recipients/bulk` -> Multipart form-data with `file` (CSV file)
- `PUT /recipients/:id` -> Update recipient details
- `DELETE /recipients/:id` -> Delete recipient

## 4. Settings (`/settings`)
- `GET /settings` -> Return settings (with `smtp_password` masked as `••••••••`)
- `POST /settings/smtp` -> Save SMTP config (encrypts password via AES-256-GCM)
- `POST /settings/smtp/test` -> Test connection via nodemailer `verify()`
- `PUT /settings` -> Update sending limits, identity, compliance, and notification preferences

## 5. Campaigns (`/campaigns`)
- `GET /campaigns` -> List user campaigns with status summary
- `POST /campaigns` -> Create campaign draft: `{ "subject": "Hello", "body": "Hi {{first_name}}", "recipient_ids": ["uuid1"] }`
- `GET /campaigns/:id` -> Detailed campaign view
- `PUT /campaigns/:id` -> Update draft campaign
- `DELETE /campaigns/:id` -> Delete campaign

## 6. Send Engine (`/campaigns/:id/send` & `/status`)
- `POST /campaigns/:id/send` -> Triggers sequential background send queue
- `GET /campaigns/:id/status` -> Get realtime progress and per-recipient status

---

## Architecture & Production Limitations
> [!WARNING]
> **MVP Database Limitation Notice:**
> 1. **Concurrency**: Writes use an in-memory queue mutex. This prevents corruption within a single Node.js instance, but does not scale horizontally across multiple instances.
> 2. **Transactions**: No atomic rollback transactions.
> 3. **Performance**: Lookups are O(n) array scans. For production scale (>10,000 records), replace `/src/db.js` with PostgreSQL or MongoDB adapters.
