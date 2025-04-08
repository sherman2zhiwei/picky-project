import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const images = await prisma.image.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedImages = images.map(image => ({
      id: image.id,
      originalUrl: `/uploads/original/${image.originalPath}`,
      compressedUrl: `/uploads/compressed/${image.compressedPath}`,
      originalSize: image.originalSize,
      compressedSize: image.compressedSize,
      width: image.width,
      height: image.height,
      mimeType: image.mimeType,
      filename: image.filename,
      createdAt: image.createdAt
    }))

    return res.status(200).json({ images: formattedImages })
  } catch (error) {
    console.error('Error fetching images:', error)
    return res.status(500).json({ error: 'Failed to fetch images' })
  }
}