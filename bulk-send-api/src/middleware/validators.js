const { body, validationResult } = require('express-validator');

// ─── Validation result handler ───────────────────────────────────────────────
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

// ─── Auth validators ─────────────────────────────────────────────────────────
const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// ─── Recipient validators ─────────────────────────────────────────────────────
const recipientRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('custom_fields').optional().isObject().withMessage('custom_fields must be an object'),
];

// ─── Campaign validators ──────────────────────────────────────────────────────
const campaignRules = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('body').trim().notEmpty().withMessage('Body is required'),
  body('recipient_ids').isArray({ min: 1 }).withMessage('At least one recipient required'),
];

// ─── SMTP settings validators ─────────────────────────────────────────────────
const smtpRules = [
  body('sender_name').trim().notEmpty().withMessage('Sender name is required'),
  body('sender_email').isEmail().normalizeEmail().withMessage('Valid sender email required'),
  body('smtp_host').trim().notEmpty().withMessage('SMTP host is required'),
  body('smtp_port').isInt({ min: 1, max: 65535 }).withMessage('Valid SMTP port required'),
  body('smtp_username').trim().notEmpty().withMessage('SMTP username is required'),
  body('smtp_password').trim().notEmpty().withMessage('SMTP password is required'),
  body('encryption').isIn(['none', 'ssl', 'tls']).withMessage('Encryption must be none, ssl, or tls'),
  body('auth_method').isIn(['password', 'oauth2']).withMessage('Auth method must be password or oauth2'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  recipientRules,
  campaignRules,
  smtpRules,
};
