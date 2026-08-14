const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET all settings
router.get('/', settingsController.getSettings);

// 1. Connected Account routes
router.post('/connected-account', settingsController.saveConnectedAccount);
router.delete('/connected-account', settingsController.disconnectAccount);

// 2. SMTP Configuration routes
router.post('/smtp', settingsController.saveSmtp);
router.post('/smtp/test', settingsController.testSmtp);

// 3. Sender Identity route
router.put('/sender-identity', settingsController.saveSenderIdentity);

// General preferences update route
router.put('/', settingsController.updatePreferences);

module.exports = router;
