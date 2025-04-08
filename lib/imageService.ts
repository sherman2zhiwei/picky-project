import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { prisma } from './prisma'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'

const writeFileAsync = promisify(fs.writeFile)
const mkdirAsync = promisify(fs.mkdir)

export interface ImageMetadata {
  width: number
  height: number
  size: number
  mimeType: string
}

export class ImageService {
  private readonly uploadDir: string = path.join(process.cwd(), 'public', 'uploads')
  private readonly originalDir: string = path.join(this.uploadDir, 'original')
  private readonly compressedDir: string = path.join(this.uploadDir, 'compressed')

  constructor() {
    this.ensureDirectoriesExist()
  }

  private async ensureDirectoriesExist() {
    await mkdirAsync(this.uploadDir, { recursive: true })
    await mkdirAsync(this.originalDir, { recursive: true })
    await mkdirAsync(this.compressedDir, { recursive: true })
  }

  // Public method to get the upload directory
  getUploadDir(): string {
    return this.uploadDir;
  }

  // Public methods to get subdirectories
  getOriginalDir(): string {
    return this.originalDir;
  }

  getCompressedDir(): string {
    return this.compressedDir;
  }

  async saveImage(imageBuffer: Buffer, filename: string): Promise<string> {
    const uniqueFilename = `${Date.now()}-${filename}`
    const filePath = path.join(this.originalDir, uniqueFilename)
    await writeFileAsync(filePath, imageBuffer)
    return uniqueFilename
  }

  async getImageMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
    const fileType = await fileTypeFromBuffer(imageBuffer)
    const metadata = await sharp(imageBuffer).metadata()
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: imageBuffer.length,
      mimeType: fileType?.mime || 'application/octet-stream'
    }
  }

  async compressImage(imagePath: string, filename: string): Promise<{
    compressedPath: string;
    compressedSize: number;
  }> {
    // In a real-world scenario, you might call an external service here
    // For simplicity, we'll use sharp to compress the image locally
    
    const uniqueFilename = `${Date.now()}-compressed-${filename}`
    const outputPath = path.join(this.compressedDir, uniqueFilename)
    
    const imageBuffer = fs.readFileSync(path.join(this.originalDir, imagePath))
    
    await sharp(imageBuffer)
      .jpeg({ quality: 70 }) // Compress with 70% quality
      .toFile(outputPath)
    
    const stats = fs.statSync(outputPath)
    
    return {
      compressedPath: uniqueFilename,
      compressedSize: stats.size
    }
  }

  async storeImageMetadata(
    originalPath: string,
    compressedPath: string,
    metadata: ImageMetadata,
    compressedSize: number,
    filename: string
  ) {
    return prisma.image.create({
      data: {
        originalPath,
        compressedPath,
        originalSize: metadata.size,
        compressedSize,
        mimeType: metadata.mimeType,
        width: metadata.width,
        height: metadata.height,
        filename
      }
    })
  }
}