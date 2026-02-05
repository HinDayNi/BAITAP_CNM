const { PutCommand, ScanCommand, DeleteCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/db");

const TABLE_NAME = "Products";

// Create or Update Product
const saveProduct = async (id, name, price, url_image) => {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            id: id,
            name: name,
            price: Number(price), // Ensure price is a number
            url_image: url_image
        }
    });

    try {
        await docClient.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error saving product:", error);
        throw error;
    }
};

// Get All Products
const getAllProducts = async () => {
    const command = new ScanCommand({
        TableName: TABLE_NAME
    });

    try {
        const response = await docClient.send(command);
        return response.Items;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

// Delete Product
const deleteProduct = async (id) => {
    const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
            id: id
        }
    });

    try {
        await docClient.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

// Get Single Product (For Edit)
const getProductById = async (id) => {
    const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: id }
    });

    try {
        const response = await docClient.send(command);
        return response.Item;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};

module.exports = { saveProduct, getAllProducts, deleteProduct, getProductById };
