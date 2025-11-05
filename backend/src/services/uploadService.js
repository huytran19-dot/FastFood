const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadService = {
  // Upload from file buffer (memory storage)
  uploadImageFromBuffer: async (fileBuffer, folder = 'fastfood') => {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(fileBuffer);
      });
    } catch (err) {
      throw new Error('Upload to Cloudinary failed: ' + err.message);
    }
  },

  // Legacy: Upload from file path (disk storage) - kept for backward compatibility
  uploadImage: async (filePath, folder = 'fastfood') => {
    try {
      const result = await cloudinary.uploader.upload(filePath, { folder });
      return result.secure_url;
    } catch (err) {
      throw new Error('Upload to Cloudinary failed: ' + err.message);
    }
  },
};

module.exports = uploadService;
