require("dotenv").config();

const {DynamoDBClient} = require("@aws-sdk/client-dynamodb")
const {DynamoDBDocumentClient} = require("@aws-sdk/lib-dynamodb")
const {S3Client} = require("@aws-sdk/client-s3")

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

const dynamoDB = DynamoDBDocumentClient.from(client)

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

module.exports = {dynamoDB, s3Client, BUCKET: process.env.AWS_BUCKET_NAME, REGION: process.env.AWS_REGION}
        
    