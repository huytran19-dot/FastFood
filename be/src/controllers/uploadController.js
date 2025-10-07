const uploadService = require('../services/uploadService');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = await uploadService.uploadImage(req.file.path);
    res.json({ image_url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
