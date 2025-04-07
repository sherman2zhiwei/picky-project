// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Create a custom type for files
interface FormidableFile {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
}

// Create a custom interface for parsed form data
interface ParsedForm {
  fields: formidable.Fields;
  files: {
    [key: string]: FormidableFile | FormidableFile[];
  };
}

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create uploads folder if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  try {
    // Create our custom promise-based parser function
    const parseForm = async (req: NextApiRequest): Promise<ParsedForm> => {
      return new Promise((resolve, reject) => {
        const form = formidable({
          uploadDir: uploadsDir,
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB limit
        });

        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });
    };

    // Parse the incoming form data
    const { files } = await parseForm(req);

    // Handling in cases where imageFile is an array
    const imageFile = (Array.isArray(files.image) ? files.image[0] : files.image) as FormidableFile

    if (!imageFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type (optional)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (imageFile.mimetype && !allowedTypes.includes(imageFile.mimetype)) {
      // Remove the file
      fs.unlinkSync(imageFile.filepath);
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalFilename = imageFile.originalFilename || 'unknown.jpg';
    const newFilename = `${timestamp}-${originalFilename}`;
    const newPath = path.join(uploadsDir, newFilename);
    
    // Rename the file
    fs.renameSync(imageFile.filepath, newPath);

    // Return success response with the file path
    return res.status(200).json({
      success: true,
      filePath: `/uploads/${newFilename}`,
      fileSize: imageFile.size,
      fileType: imageFile.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Server error during upload' });
  }
}