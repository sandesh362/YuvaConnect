import { Request, Response } from "express";
import { uploadImage } from "../services/upload.service";

export async function upload(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ message: "Provide an image in the file field" });
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Only image uploads are supported" });
  }

  try {
    const url = await uploadImage(req.file.buffer);
    return res.status(201).json({ url });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : "Image upload failed" });
  }
}
