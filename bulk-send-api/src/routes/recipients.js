const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const recipientsController = require('../controllers/recipientsController');
const { recipientRules, validate } = require('../middleware/validators');

// multer: store CSV in memory (small files only — MVP limitation)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.use(authMiddleware);

router.get('/', recipientsController.list);
router.post('/', recipientRules, validate, recipientsController.create);
router.post('/bulk', upload.single('file'), recipientsController.bulkCreate);
router.put('/:id', recipientsController.update);
router.delete('/:id', recipientsController.remove);

module.exports = router;
