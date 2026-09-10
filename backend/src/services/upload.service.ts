import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

export function uploadFile(buffer: Buffer, folder = "yuvaconnect") {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is not configured");
  }

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result?.secure_url) return reject(error ?? new Error("Image upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
