import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Interface for photo metadata
interface PhotoMetadata {
  fileName: string;
  date: string;
  caption: string;
  size: number;
  uploadedAt: string;
}

// Path to the metadata JSON file
const metadataFilePath = join(process.cwd(), 'public', 'uploads', 'metadata.json');

// Function to read existing metadata
async function readMetadata(): Promise<PhotoMetadata[]> {
  try {
    if (!existsSync(metadataFilePath)) {
      return [];
    }
    const data = await readFile(metadataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return [];
  }
}

export async function GET() {
  try {
    const metadata = await readMetadata();
    
    // Sort photos by date (newest first)
    metadata.sort((a: PhotoMetadata, b: PhotoMetadata) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return NextResponse.json({
      success: true,
      photos: metadata.map((photo: PhotoMetadata) => ({
        ...photo,
        url: `/uploads/${photo.fileName}`,
      })),
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
} 