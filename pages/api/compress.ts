// FILE: pages/api/images/compress.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import { ImageService } from '../../lib/imageService'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const imageService = new ImageService();
    
    // Parse the multipart form data with updated formidable API
    const form = new IncomingForm()
    
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve({ fields, files })
      })
    })
    
    const uploadedFile = files.image
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No image uploaded' })
    }
    
    // Handle potential array structure in newer formidable versions
    const fileToProcess = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile
    
    // Read the file into a buffer for metadata extraction
    const imageBuffer = fs.readFileSync(fileToProcess.filepath)
    
    // Get image metadata
    const metadata = await imageService.getImageMetadata(imageBuffer)
    
    // Save the original image temporarily
    const tempFilename = `temp-${Date.now()}-${fileToProcess.originalFilename || 'unknown'}`;
    const savedFileName = await imageService.saveImage(imageBuffer, tempFilename);
    
    // Compress the image using the ImageService
    const { compressedPath, compressedSize } = await imageService.compressImage(
      savedFileName, 
      fileToProcess.originalFilename || 'unknown'
    )
    
    // Get paths to the images
    const originalPath = path.join(imageService.getUploadDir(), 'original', tempFilename);
    const compressedFullPath = path.join(imageService.getUploadDir(), 'compressed', compressedPath);
    
    // Read the compressed image
    const compressedBuffer = fs.readFileSync(compressedFullPath);
    
    // Clean up temporary files
    try {
      fs.unlinkSync(originalPath);
      fs.unlinkSync(compressedFullPath);
    } catch (err) {
      console.error('Error cleaning up temporary files:', err);
    }
    
    return res.status(200).json({
      success: true,
      originalSize: metadata.size,
      compressedSize,
      compressionRatio: (compressedSize / metadata.size).toFixed(2),
      buffer: compressedBuffer.toString('base64')
    })
    
  } catch (error) {
    console.error('Error compressing image:', error)
    return res.status(500).json({ error: 'Failed to compress image' })
  }
}