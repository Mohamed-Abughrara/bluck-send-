const db = require('../db');
const { encrypt } = require('../services/cryptoService');
const { verifyConnection } = require('../services/emailService');

// Get user settings (or return defaults)
function getSettings(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const [settings] = db.findWhere('settings', (s) => s.user_id === userId);

    if (!settings) {
      return res.json({
        user_id: userId,
        connected_account: {
          email: 'mohamed@example.com',
          provider: 'Google',
          status: 'connected',
        },
        use_smtp: false,
        sender_name: 'Mohamed Ali',
        sender_email: 'mohamed@mydomain.com',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: 'mohamed@mydomain.com',
        smtp_password: '••••••••',
        encryption: 'tls',
        auth_method: 'password',
        sending_limits: { daily_limit: 450, delay_seconds: 3, auto_pause: true },
        sender_identity: { reply_to: 'replies@mydomain.com', signature: 'Best regards,\nMohamed Ali' },
        compliance: { auto_unsubscribe: true, unsub_url: 'https://mydomain.com/unsubscribe', require_consent: false },
        notifications: { on_finish: true, on_high_failure: true }
      });
    }

    // Mask password before returning
    const safeSettings = {
      ...settings,
      smtp_password: settings.smtp_password ? '••••••••' : ''
    };

    res.json(safeSettings);
  } catch (err) {
    next(err);
  }
}

// 1. Connected Account controller methods
async function saveConnectedAccount(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { email, provider, status } = req.body;

    const [existing] = db.findWhere('settings', (s) => s.user_id === userId);
    const accountData = {
      email: email || 'mohamed@example.com',
      provider: provider || 'Google',
      status: status || 'connected',
    };

    let result;
    if (existing) {
      result = await db.update('settings', existing.id, { connected_account: accountData });
    } else {
      result = await db.insert('settings', {
        user_id: userId,
        connected_account: accountData,
        use_smtp: false,
        sender_name: '',
        sender_email: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        encryption: 'tls',
        auth_method: 'password',
      });
    }

    res.json({ message: 'Connected account updated', connected_account: result.connected_account });
  } catch (err) {
    next(err);
  }
}

async function disconnectAccount(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const [existing] = db.findWhere('settings', (s) => s.user_id === userId);

    const accountData = { email: '', provider: '', status: 'disconnected' };

    if (existing) {
      await db.update('settings', existing.id, { connected_account: accountData });
    }

    res.json({ message: 'Account disconnected', connected_account: accountData });
  } catch (err) {
    next(err);
  }
}

// 2. Save SMTP Config
async function saveSmtp(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const {
      sender_name,
      sender_email,
      smtp_host,
      smtp_port,
      smtp_username,
      smtp_password,
      encryption,
      auth_method,
      use_smtp
    } = req.body;

    let encryptedPass = smtp_password;
    if (smtp_password && smtp_password !== '••••••••') {
      encryptedPass = encrypt(smtp_password);
    }

    const [existing] = db.findWhere('settings', (s) => s.user_id === userId);

    const smtpData = {
      user_id: userId,
      use_smtp: use_smtp !== undefined ? use_smtp : true,
      sender_name: sender_name || '',
      sender_email: sender_email || '',
      smtp_host: smtp_host || '',
      smtp_port: parseInt(smtp_port, 10) || 587,
      smtp_username: smtp_username || '',
      ...(smtp_password && smtp_password !== '••••••••' && { smtp_password: encryptedPass }),
      encryption: encryption || 'tls',
      auth_method: auth_method || 'password',
    };

    let result;
    if (existing) {
      result = await db.update('settings', existing.id, smtpData);
    } else {
      result = await db.insert('settings', {
        ...smtpData,
        sending_limits: { daily_limit: 450, delay_seconds: 3, auto_pause: true },
        sender_identity: { reply_to: '', signature: '' },
        compliance: { auto_unsubscribe: true, unsub_url: '', require_consent: false },
        notifications: { on_finish: true, on_high_failure: true }
      });
    }

    res.json({
      message: 'SMTP configuration saved',
      settings: { ...result, smtp_password: '••••••••' }
    });
  } catch (err) {
    next(err);
  }
}

// Test SMTP connection
async function testSmtp(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    let { smtp_host, smtp_port, smtp_username, smtp_password, encryption, sender_name, sender_email } = req.body;

    if (!smtp_host || !smtp_username) {
      return res.status(400).json({ success: false, error: 'SMTP Host and Username are required' });
    }

    if (!smtp_password || smtp_password === '••••••••') {
      const [existing] = db.findWhere('settings', (s) => s.user_id === userId);
      if (!existing || !existing.smtp_password) {
        return res.status(400).json({ success: false, error: 'SMTP password is required to test connection' });
      }
      smtp_password = existing.smtp_password;
    }

    const smtpConfig = {
      smtp_host,
      smtp_port: parseInt(smtp_port, 10) || 587,
      smtp_username,
      smtp_password,
      encryption: encryption || 'tls',
      sender_name,
      sender_email,
    };

    await verifyConnection(smtpConfig);
    res.json({ success: true, message: 'SMTP connection successful' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'SMTP connection failed' });
  }
}

// 3. Save Sender Identity
async function saveSenderIdentity(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { sender_name, sender_email, reply_to, signature } = req.body;

    const [existing] = db.findWhere('settings', (s) => s.user_id === userId);

    let result;
    if (existing) {
      result = await db.update('settings', existing.id, {
        ...(sender_name !== undefined && { sender_name }),
        ...(sender_email !== undefined && { sender_email }),
        sender_identity: {
          reply_to: reply_to || '',
          signature: signature || '',
        },
      });
    } else {
      result = await db.insert('settings', {
        user_id: userId,
        sender_name: sender_name || '',
        sender_email: sender_email || '',
        sender_identity: { reply_to: reply_to || '', signature: signature || '' },
      });
    }

    res.json({ message: 'Sender Identity updated', sender_identity: result.sender_identity });
  } catch (err) {
    next(err);
  }
}

// General preferences update
async function updatePreferences(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const [existing] = db.findWhere('settings', (s) => s.user_id === userId);

    const { sending_limits, sender_identity, compliance, notifications, use_smtp, sender_name, sender_email } = req.body;

    let result;
    if (existing) {
      result = await db.update('settings', existing.id, {
        ...(use_smtp !== undefined && { use_smtp }),
        ...(sender_name !== undefined && { sender_name }),
        ...(sender_email !== undefined && { sender_email }),
        ...(sending_limits && { sending_limits: { ...existing.sending_limits, ...sending_limits } }),
        ...(sender_identity && { sender_identity: { ...existing.sender_identity, ...sender_identity } }),
        ...(compliance && { compliance: { ...existing.compliance, ...compliance } }),
        ...(notifications && { notifications: { ...existing.notifications, ...notifications } }),
      });
    } else {
      result = await db.insert('settings', {
        user_id: userId,
        use_smtp: use_smtp || false,
        sender_name: sender_name || '',
        sender_email: sender_email || '',
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        encryption: 'tls',
        auth_method: 'password',
        sending_limits: sending_limits || { daily_limit: 450, delay_seconds: 3, auto_pause: true },
        sender_identity: sender_identity || { reply_to: '', signature: '' },
        compliance: compliance || { auto_unsubscribe: true, unsub_url: '', require_consent: false },
        notifications: notifications || { on_finish: true, on_high_failure: true }
      });
    }

    res.json({
      message: 'Settings updated',
      settings: { ...result, smtp_password: result.smtp_password ? '••••••••' : '' }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  saveConnectedAccount,
  disconnectAccount,
  saveSmtp,
  testSmtp,
  saveSenderIdentity,
  updatePreferences,
};
