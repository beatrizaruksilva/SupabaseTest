import { S3Client } from "@aws-sdk/client-s3";

const accountId = import.meta.env.VITE_R2_ACCOUNT_ID;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_R2_BUCKET_NAME;
const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

// Validation (Optional but helpful)
if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.warn("R2 credentials not found in environment variables.");
}
// Debugging R2 Connection
console.log("--- R2 DEBUG ---");
console.log("Account ID:", accountId);
console.log("Endpoint:", `https://${accountId}.r2.cloudflarestorage.com`);
console.log("Bucket:", bucketName);
console.log("----------------");

export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

export const R2_BUCKET_NAME = bucketName;
export const R2_PUBLIC_URL = publicUrl;
