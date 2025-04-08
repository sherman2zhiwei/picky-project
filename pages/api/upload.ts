import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import { ImageService } from "../../lib/imageService";
import fs from "fs";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const imageService = new ImageService();

  try {
    // Parse the multipart form data
    const form = new IncomingForm();

    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Handling in cases where imageFile is an array
    const imageFile = (
      Array.isArray(files.image) ? files.image[0] : files.image
    ) as FormidableFile;

    if (!imageFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (imageFile.mimetype && !allowedTypes.includes(imageFile.mimetype)) {
      // Remove the file
      fs.unlinkSync(imageFile.filepath);
      return res.status(400).json({
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      });
    }

    // Read the file into a buffer
    const imageBuffer = fs.readFileSync(imageFile.filepath);

    // Get image metadata
    const metadata = await imageService.getImageMetadata(imageBuffer);

    // Save original image
    const originalFilename = await imageService.saveImage(
      imageBuffer,
      imageFile.originalFilename || "unknown"
    );

    // Compress the image
    const { compressedPath, compressedSize } = await imageService.compressImage(
      originalFilename,
      imageFile.originalFilename || "unknown"
    );

    // Store metadata in database
    const storedImage = await imageService.storeImageMetadata(
      originalFilename,
      compressedPath,
      metadata,
      compressedSize,
      imageFile.originalFilename || "unknown"
    );

    return res.status(200).json({
      success: true,
      image: {
        id: storedImage.id,
        originalUrl: `/uploads/original/${originalFilename}`,
        compressedUrl: `/uploads/compressed/${compressedPath}`,
        originalSize: metadata.size,
        compressedSize,
        width: metadata.width,
        height: metadata.height,
        mimeType: metadata.mimeType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Server error during upload" });
  }
}
