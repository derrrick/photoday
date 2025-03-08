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

    // Create metadata for the uploaded photo
    const photoMetadata: PhotoMetadata = {
      fileName,
      date,
      caption,
      size: image.size,
      uploadedAt: new Date().toISOString(),
    };

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