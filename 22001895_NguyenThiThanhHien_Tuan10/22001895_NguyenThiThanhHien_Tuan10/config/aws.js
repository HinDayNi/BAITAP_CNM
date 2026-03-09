require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

// 1. Cấu hình xác thực AWS
const awsConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
};

// 2. Khởi tạo S3 Client (Lưu trữ ảnh)
const s3Client = new S3Client(awsConfig);

// 3. Khởi tạo DynamoDB Client (Lưu trữ dữ liệu)
const baseClient = new DynamoDBClient(awsConfig);
const dynamoDB = DynamoDBDocumentClient.from(baseClient);

// 4. Xuất các biến cấu hình để sử dụng toàn hệ thống
module.exports = {
    dynamoDB,
    s3Client,
    S3_BUCKET: process.env.S3_BUCKET_NAME,
    TABLE_NAME: process.env.DYNAMODB_TABLE_NAME || "Products",
    REGION: process.env.AWS_REGION
};