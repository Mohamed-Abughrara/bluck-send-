const db = require('../db');
const { sendMail } = require('./emailService');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple template engine for personalizing email body
function personalize(template, recipient) {
  let text = template;

  // Standard tokens
  text = text.replace(/\{\{first_name\}\}/g, recipient.name.split(' ')[0] || recipient.name);
  text = text.replace(/\{\{name\}\}/g, recipient.name);
  text = text.replace(/\{\{email\}\}/g, recipient.email);

  // Custom fields tokens (e.g. {{company}})
  if (recipient.custom_fields) {
    Object.keys(recipient.custom_fields).forEach((key) => {
      const reg = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      text = text.replace(reg, recipient.custom_fields[key] || '');
    });
  }

  return text;
}

// Append unsubscribe link if enabled
function appendUnsubscribe(htmlBody, unsubUrl) {
  const url = unsubUrl || '#';
  const unsubHtml = `<br/><hr/><p style="font-size:12px;color:#888;">If you wish to stop receiving these emails, <a href="${url}">unsubscribe here</a>.</p>`;
  return htmlBody + unsubHtml;
}

// Helper to count today's sends for a user across all campaigns
function getTodaySentCount(userId) {
  const todayStr = new Date().toISOString().split('T')[0];
  const userSends = db.findWhere('sends', (s) => s.user_id === userId && s.status === 'sent');
  return userSends.filter((s) => s.created_at.startsWith(todayStr)).length;
}

async function processCampaignSend(campaignId, userId) {
  const campaign = db.findById('campaigns', campaignId);
  const [settings] = db.findWhere('settings', (s) => s.user_id === userId);

  if (!campaign || !settings) return;

  const limits = settings.sending_limits || { daily_limit: 450, delay_seconds: 3, auto_pause: true };
  const compliance = settings.compliance || { auto_unsubscribe: true, unsub_url: '' };
  const identity = settings.sender_identity || { reply_to: '', signature: '' };

  await db.update('campaigns', campaign.id, { status: 'sending' });

  const queuedSends = db.findWhere('sends', (s) => s.campaign_id === campaignId && s.status === 'queued');
  let failedCount = 0;
  let totalAttempted = 0;

  for (const sendRecord of queuedSends) {
    // 1. Check daily limit
    const sentToday = getTodaySentCount(userId);
    if (sentToday >= limits.daily_limit) {
      await db.update('sends', sendRecord.id, {
        status: 'skipped_limit',
        error_message: 'Daily send limit reached for today',
      });
      continue;
    }

    // 2. Fetch recipient
    const recipient = db.findById('recipients', sendRecord.recipient_id);
    if (!recipient) {
      await db.update('sends', sendRecord.id, {
        status: 'failed',
        error_message: 'Recipient no longer exists',
      });
      failedCount++;
      totalAttempted++;
      continue;
    }

    // 3. Personalize message & signature
    let htmlContent = personalize(campaign.body, recipient);
    if (identity.signature) {
      htmlContent += `<br/><br/>${personalize(identity.signature, recipient)}`;
    }
    if (compliance.auto_unsubscribe) {
      htmlContent = appendUnsubscribe(htmlContent, compliance.unsub_url);
    }

    // 4. Send email
    try {
      await sendMail(settings, {
        to: recipient.email,
        subject: personalize(campaign.subject, recipient),
        html: htmlContent,
        replyTo: identity.reply_to || undefined,
      });

      await db.update('sends', sendRecord.id, {
        status: 'sent',
        delivered_at: new Date().toISOString(),
      });
    } catch (err) {
      failedCount++;
      await db.update('sends', sendRecord.id, {
        status: 'failed',
        error_message: err.message,
      });
    }

    totalAttempted++;

    // 5. Check failure rate auto-pause
    if (limits.auto_pause && totalAttempted >= 5) {
      const failRate = (failedCount / totalAttempted) * 100;
      if (failRate > 10) {
        await db.update('campaigns', campaign.id, { status: 'paused' });
        console.warn(`[SendEngine] Campaign ${campaign.id} paused due to high failure rate (${failRate.toFixed(1)}%)`);
        return;
      }
    }

    // 6. Delay between sends
    if (limits.delay_seconds > 0) {
      await sleep(limits.delay_seconds * 1000);
    }
  }

  // Final campaign status update
  const remainingQueued = db.findWhere('sends', (s) => s.campaign_id === campaignId && s.status === 'queued');
  if (remainingQueued.length === 0) {
    await db.update('campaigns', campaign.id, { status: 'completed' });
  }
}

module.exports = { processCampaignSend };
