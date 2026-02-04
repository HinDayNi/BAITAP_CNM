import { PutCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/aws.js";

const TableName = 'Users';

export const createUser = async (user) => {
    await ddb.send(new PutCommand({
        TableName,
        Item: user
    }));
};

export const findUserByUsername = async (username) => {
    // Scan is expensive, but for authentication without a GSI on username, it's the only initial way if PK is userId.
    // Ideally, username should be a GSI or the PK. But the requirement says userId is PK (UUID).
    // So we must scan or add GSI. For this lab, Scan is likely acceptable or I can assume we scan.

    const result = await ddb.send(new ScanCommand({
        TableName,
        FilterExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username
        }
    }));
    return result.Items[0];
};

export const findUserById = async (userId) => {
    const result = await ddb.send(new GetCommand({
        TableName,
        Key: { userId }
    }));
    return result.Item;
};
