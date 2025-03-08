import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Interface for photo metadata
interface PhotoMetadata {
  fileName: string;
  date: string;
  caption: string;
  size: number;
  uploadedAt: string;
  url: string;
  location?: string;
  takenAt?: string;
  metadata?: {
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
  };
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

// Function to write metadata
async function writeMetadata(metadata: PhotoMetadata[]): Promise<void> {
  await writeFile(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const date = formData.get('date') as string;
    const caption = formData.get('caption') as string;
    const location = formData.get('location') as string | null;
    const takenAt = formData.get('takenAt') as string | null;
    const metadataStr = formData.get('metadata') as string | null;

    if (!image || !date) {
      return NextResponse.json(
        { error: 'Image and date are required' },
        { status: 400 }
      );
    }

    // Create a unique filename based on date and original filename
    const fileExtension = image.name.split('.').pop();
    const fileName = `${date}-${Date.now()}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Write the file to the uploads directory
    const filePath = join(uploadsDir, fileName);
    const buffer = Buffer.from(await image.arrayBuffer());
    await writeFile(filePath, buffer);

    // Parse camera metadata if provided
    let cameraMetadata = undefined;
    if (metadataStr) {
      try {
        cameraMetadata = JSON.parse(metadataStr);
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }

    // Create metadata for the uploaded photo
    const photoMetadata: PhotoMetadata = {
      fileName,
      date,
      caption,
      size: image.size,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${fileName}`,
    };

    // Add optional fields if provided
    if (location) photoMetadata.location = location;
    if (takenAt) photoMetadata.takenAt = takenAt;
    if (cameraMetadata) photoMetadata.metadata = cameraMetadata;

    // Read existing metadata, add the new entry, and write back
    const existingMetadata = await readMetadata();
    existingMetadata.push(photoMetadata);
    await writeMetadata(existingMetadata);

    // Return success response with the file path
    return NextResponse.json({
      success: true,
      filePath: `/uploads/${fileName}`,
      date,
      caption,
      metadata: photoMetadata,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Increase the body size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 