import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

const awsConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const ddbClient = new DynamoDBClient(awsConfig);
const ddb = DynamoDBDocumentClient.from(ddbClient);

const s3 = new S3Client(awsConfig);

import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const deleteS3Object = async (url) => {
    if (!url) return;
    try {
        const bucketMatch = url.match(/https:\/\/(.+?)\.s3\./);
        const keyMatch = url.match(/amazonaws\.com\/(.+)/);

        if (bucketMatch && keyMatch) {
            const bucket = bucketMatch[1];
            const key = keyMatch[1];
            await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        }
    } catch (e) {
        console.error("Error deleting S3 object:", e);
    }
};

export { ddbClient, ddb, s3 };
