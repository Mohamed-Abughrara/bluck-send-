const db = require('../db');
const { processCampaignSend } = require('../services/sendQueue');

async function triggerSend(req, res, next) {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;

    const campaign = db.findById('campaigns', campaignId);
    if (!campaign || campaign.user_id !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'sending' || campaign.status === 'completed') {
      return res.status(400).json({ error: `Campaign is already ${campaign.status}` });
    }

    // 1. Validate working SMTP config exists
    const [settings] = db.findWhere('settings', (s) => s.user_id === userId);
    if (!settings || !settings.smtp_host || !settings.smtp_username) {
      return res.status(400).json({ error: 'SMTP settings missing or incomplete. Please configure SMTP first.' });
    }

    // 2. Create send records for queued items
    for (const recipientId of campaign.recipient_ids) {
      const existing = db.findWhere('sends', (s) => s.campaign_id === campaignId && s.recipient_id === recipientId);
      if (existing.length === 0) {
        await db.insert('sends', {
          campaign_id: campaignId,
          user_id: userId,
          recipient_id: recipientId,
          status: 'queued',
          error_message: null,
          delivered_at: null,
        });
      }
    }

    // 3. Trigger asynchronous background send processing
    processCampaignSend(campaignId, userId).catch((err) => {
      console.error('[SendQueue] Error processing send:', err);
    });

    res.json({
      message: 'Campaign send started',
      campaign_id: campaignId,
      recipient_count: campaign.recipient_ids.length,
    });
  } catch (err) {
    next(err);
  }
}

function getCampaignStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;

    const campaign = db.findById('campaigns', campaignId);
    if (!campaign || campaign.user_id !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const sends = db.findWhere('sends', (s) => s.campaign_id === campaignId);
    const recipients = db.findWhere('recipients', (r) => r.user_id === userId);
    const recipientMap = Object.fromEntries(recipients.map((r) => [r.id, r]));

    const counts = {
      total: sends.length,
      sent: sends.filter((s) => s.status === 'sent').length,
      failed: sends.filter((s) => s.status === 'failed').length,
      queued: sends.filter((s) => s.status === 'queued').length,
      skipped_limit: sends.filter((s) => s.status === 'skipped_limit').length,
    };

    const details = sends.map((s) => ({
      ...s,
      recipient_name: recipientMap[s.recipient_id]?.name || 'Unknown',
      recipient_email: recipientMap[s.recipient_id]?.email || 'Unknown',
    }));

    res.json({
      campaign_id: campaign.id,
      subject: campaign.subject,
      status: campaign.status,
      counts,
      progress_percent: counts.total > 0 ? Math.round((counts.sent / counts.total) * 100) : 0,
      sends: details,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { triggerSend, getCampaignStatus };
