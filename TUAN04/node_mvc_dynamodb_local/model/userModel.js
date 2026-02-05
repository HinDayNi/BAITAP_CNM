const { PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/db");

const TABLE_NAME = "Users";

const createUser = async (userId, name, email) => {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            UserID: userId,
            Name: name,
            Email: email
        }
    });

    try {
        await docClient.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

const getAllUsers = async () => {
    const command = new ScanCommand({
        TableName: TABLE_NAME
    });

    try {
        const response = await docClient.send(command);
        return response.Items;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

const deleteUser = async (userId) => {
    const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
            UserID: userId
        }
    });

    try {
        await docClient.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

module.exports = { createUser, getAllUsers, deleteUser };
