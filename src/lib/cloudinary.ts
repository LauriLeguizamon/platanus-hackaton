import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export async function uploadToCloudinary(
  remoteUrl: string,
  options?: { folder?: string; resourceType?: "image" | "video" }
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(remoteUrl, {
    folder: options?.folder ?? "seoul-studio",
    resource_type: options?.resourceType ?? "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
