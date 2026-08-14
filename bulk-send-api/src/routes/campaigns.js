const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const campaignsController = require('../controllers/campaignsController');
const sendController = require('../controllers/sendController');
const { campaignRules, validate } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', campaignsController.list);
router.post('/', campaignRules, validate, campaignsController.create);
router.get('/:id', campaignsController.getOne);
router.put('/:id', campaignsController.update);
router.delete('/:id', campaignsController.remove);

// Send Engine Endpoints
router.post('/:id/send', sendController.triggerSend);
router.get('/:id/status', sendController.getCampaignStatus);

module.exports = router;
