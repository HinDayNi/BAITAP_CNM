import { PutCommand, ScanCommand, GetCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/aws.js";

const TableName = 'Categories';

export const getAllCategories = async () => {
    const result = await ddb.send(new ScanCommand({ TableName }));
    return result.Items || [];
};

export const getCategoryById = async (categoryId) => {
    const result = await ddb.send(new GetCommand({
        TableName,
        Key: { categoryId }
    }));
    return result.Item;
};

export const createCategory = async (category) => {
    await ddb.send(new PutCommand({
        TableName,
        Item: category
    }));
};

export const updateCategory = async (categoryId, name, description) => {
    await ddb.send(new UpdateCommand({
        TableName,
        Key: { categoryId },
        UpdateExpression: "set #n=:n, description=:d",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: {
            ":n": name,
            ":d": description
        }
    }));
};

export const deleteCategory = async (categoryId) => {
    await ddb.send(new DeleteCommand({
        TableName,
        Key: { categoryId }
    }));
};
