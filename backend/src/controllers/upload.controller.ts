import { Request, Response } from "express";
import { uploadFile } from "../services/upload.service";

export async function upload(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ message: "Provide a file in the file field" });

  try {
    const url = await uploadFile(req.file.buffer);
    return res.status(201).json({ url });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : "File upload failed" });
  }
}
