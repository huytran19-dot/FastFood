const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');

// POST /api/upload
router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;
