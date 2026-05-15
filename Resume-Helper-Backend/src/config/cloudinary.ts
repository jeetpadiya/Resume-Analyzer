import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import streamifier from 'streamifier';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer: Buffer, originalFilename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn("Cloudinary not configured. Returning placeholder URL.");
      return resolve("local-file-placeholder");
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "resume_helper",
        resource_type: "raw", 
        public_id: `${Date.now()}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      },
      (error, result) => {
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default cloudinary;
