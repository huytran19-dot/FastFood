const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadService = {
  uploadImage: async (filePath) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'fastfood_products',
      });
      return result.secure_url;
    } catch (err) {
      throw new Error('Upload to Cloudinary failed: ' + err.message);
    }
  },
};

module.exports = uploadService;
