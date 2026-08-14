const db = require('../db');

// List campaigns
function list(req, res, next) {
  try {
    const userId = req.user.id;
    const campaigns = db.findWhere('campaigns', (c) => c.user_id === userId);
    
    // Attach status summaries
    const items = campaigns.map((c) => {
      const sends = db.findWhere('sends', (s) => s.campaign_id === c.id);
      const counts = {
        total: sends.length,
        sent: sends.filter((s) => s.status === 'sent').length,
        failed: sends.filter((s) => s.status === 'failed').length,
        queued: sends.filter((s) => s.status === 'queued').length,
        skipped_limit: sends.filter((s) => s.status === 'skipped_limit').length,
      };
      return { ...c, counts };
    });

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// Get single campaign
function getOne(req, res, next) {
  try {
    const userId = req.user.id;
    const campaign = db.findById('campaigns', req.params.id);

    if (!campaign || campaign.user_id !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const sends = db.findWhere('sends', (s) => s.campaign_id === campaign.id);
    res.json({ ...campaign, sends });
  } catch (err) {
    next(err);
  }
}

// Create campaign (draft)
async function create(req, res, next) {
  try {
    const userId = req.user.id;
    const { subject, body, recipient_ids } = req.body;

    // Verify recipient_ids belong to user
    const userRecipients = db.findWhere('recipients', (r) => r.user_id === userId);
    const validIds = userRecipients.map((r) => r.id);
    const invalid = recipient_ids.filter((id) => !validIds.includes(id));

    if (invalid.length > 0) {
      return res.status(400).json({ error: 'One or more recipient_ids are invalid or do not belong to user' });
    }

    const campaign = await db.insert('campaigns', {
      user_id: userId,
      subject,
      body,
      recipient_ids,
      status: 'draft', // draft | queued | sending | completed | paused
    });

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}

// Update campaign (only while draft)
async function update(req, res, next) {
  try {
    const userId = req.user.id;
    const campaign = db.findById('campaigns', req.params.id);

    if (!campaign || campaign.user_id !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft campaigns can be edited' });
    }

    const { subject, body, recipient_ids } = req.body;

    const updated = await db.update('campaigns', campaign.id, {
      ...(subject && { subject }),
      ...(body && { body }),
      ...(recipient_ids && { recipient_ids }),
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// Delete campaign
async function remove(req, res, next) {
  try {
    const userId = req.user.id;
    const campaign = db.findById('campaigns', req.params.id);

    if (!campaign || campaign.user_id !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await db.remove('campaigns', campaign.id);
    
    // Clean up associated sends
    const sends = db.findWhere('sends', (s) => s.campaign_id === campaign.id);
    for (const send of sends) {
      await db.remove('sends', send.id);
    }

    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
