require('dotenv').config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const clientConfig = {
    region: process.env.AWS_REGION || "us-west-2",
};

if (process.env.DYNAMODB_ENDPOINT) {
    clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}

const client = new DynamoDBClient(clientConfig);

const docClient = DynamoDBDocumentClient.from(client);

module.exports = { client, docClient };
