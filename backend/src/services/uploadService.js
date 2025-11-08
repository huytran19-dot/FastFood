const cloudinary = require('cloudinary').v2;

// Cloudinary config - must check env vars are loaded
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error('❌ CLOUDINARY CONFIG ERROR:');
  console.error('Missing environment variables:');
  console.error('  CLOUD_NAME:', process.env.CLOUD_NAME ? '✓' : '✗ MISSING');
  console.error('  CLOUD_API_KEY:', process.env.CLOUD_API_KEY ? '✓' : '✗ MISSING');
  console.error('  CLOUD_API_SECRET:', process.env.CLOUD_API_SECRET ? '✓' : '✗ MISSING');
  console.error('Please check your .env file in backend folder');
  throw new Error('Cloudinary configuration is incomplete. Check .env file.');
}

console.log('✅ Cloudinary configured:', process.env.CLOUD_NAME);

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
