// src/utils/s3Storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { MeasurementEntry } from '../types';

const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
// AWS Region and credentials are expected to be configured in the environment
// e.g., via AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION environment variables
// or via an IAM role if running on EC2/ECS.

if (!BUCKET_NAME) {
  console.error("S3 Bucket name (REACT_APP_S3_BUCKET_NAME) is not configured.");
  // Potentially throw an error or have a fallback for local dev if not using S3
}

const s3Client = new S3Client({
  // region: process.env.AWS_REGION - AWS SDK v3 typically infers region from env or shared config
  // credentials: { accessKeyId: "...", secretAccessKey: "..." } - Not hardcoded
});

const DATA_PREFIX = 'data/'; // Store all entries under a "data/" prefix (like a folder)

// Helper to get readable stream to string
// The 'any' type for stream is used here for broad compatibility (e.g. Node.js Readable, browser ReadableStream)
// For a more specific environment, you might use Readable from 'stream' (Node.js) or ReadableStream (browser).
const streamToString = (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });

export const saveEntryToS3 = async (entry: MeasurementEntry): Promise<void> => {
  if (!BUCKET_NAME) throw new Error("S3 Bucket name not configured.");
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${DATA_PREFIX}${entry.id}.json`,
    Body: JSON.stringify(entry),
    ContentType: 'application/json',
  });

  try {
    await s3Client.send(command);
    console.log(`Entry ${entry.id} saved to S3.`);
  } catch (error) {
    console.error("Error saving entry to S3:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const getAllEntriesFromS3 = async (): Promise<MeasurementEntry[]> => {
  if (!BUCKET_NAME) throw new Error("S3 Bucket name not configured.");
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: DATA_PREFIX,
  });

  try {
    const output = await s3Client.send(command);
    if (!output.Contents) {
      return [];
    }

    const entriesPromises = output.Contents
      .filter(object => object.Key && object.Key !== DATA_PREFIX && object.Key.endsWith('.json')) // Ensure it's a JSON file and not the prefix itself
      .map(async (object) => {
        if (!object.Key) return null; // Should not happen due to filter, but for type safety
        const getObjectCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: object.Key,
        });
        const itemOutput = await s3Client.send(getObjectCommand);
        if (!itemOutput.Body) return null;
        const bodyString = await streamToString(itemOutput.Body);
        try {
          return JSON.parse(bodyString) as MeasurementEntry;
        } catch (parseError) {
          console.error(`Error parsing S3 object ${object.Key}:`, parseError);
          return null; // Or handle more gracefully
        }
      });

    const resolvedEntries = await Promise.all(entriesPromises);
    return resolvedEntries.filter(entry => entry !== null) as MeasurementEntry[];
  } catch (error) {
    console.error("Error fetching entries from S3:", error);
    throw error;
  }
};

export const deleteEntryFromS3 = async (entryId: number): Promise<void> => {
  if (!BUCKET_NAME) throw new Error("S3 Bucket name not configured.");
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${DATA_PREFIX}${entryId}.json`,
  });

  try {
    await s3Client.send(command);
    console.log(`Entry ${entryId} deleted from S3.`);
  } catch (error) {
    console.error("Error deleting entry from S3:", error);
    throw error;
  }
};
