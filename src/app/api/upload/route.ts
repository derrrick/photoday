import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
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

// Helper function to get current date and time in Pacific Time
function getPacificDateTime() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
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

    // Read existing metadata
    const existingMetadata = await readMetadata();
    
    // Check if a photo for this date already exists
    const existingPhotoIndex = existingMetadata.findIndex(photo => photo.date === date);
    let replacedPhoto = null;
    
    if (existingPhotoIndex !== -1) {
      // Save the existing photo info for deletion
      replacedPhoto = existingMetadata[existingPhotoIndex];
      
      // Remove the existing photo from the metadata array
      existingMetadata.splice(existingPhotoIndex, 1);
      
      // Try to delete the old file
      try {
        const oldFilePath = join(uploadsDir, replacedPhoto.fileName);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
          console.log(`Deleted old file: ${replacedPhoto.fileName}`);
        }
      } catch (error) {
        console.error('Error deleting old file:', error);
        // Continue with the upload even if deletion fails
      }
    }

    // Write the new file to the uploads directory
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
      uploadedAt: getPacificDateTime().toISOString(),
      url: `/uploads/${fileName}`,
    };

    // Add optional fields if provided
    if (location) photoMetadata.location = location;
    if (takenAt) photoMetadata.takenAt = takenAt;
    if (cameraMetadata) photoMetadata.metadata = cameraMetadata;

    // Add the new entry and write back
    existingMetadata.push(photoMetadata);
    await writeMetadata(existingMetadata);

    // Return success response with the file path and replacement info
    return NextResponse.json({
      success: true,
      filePath: `/uploads/${fileName}`,
      date,
      caption,
      metadata: photoMetadata,
      replaced: replacedPhoto ? true : false,
      replacedFile: replacedPhoto ? replacedPhoto.fileName : null
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