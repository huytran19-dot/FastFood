const uploadService = require('../services/uploadService');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload from memory buffer (more efficient)
    const folder = req.body.folder || 'fastfood'; // Allow custom folder
    const imageUrl = await uploadService.uploadImageFromBuffer(req.file.buffer, folder);
    
    res.json({ 
      success: true,
      image_url: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
