const { ScanCommand, GetCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../config/dynamodb");

function normalizeText(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

async function getAll(keyword = "") {
    const res = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = res.Items || [];
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) return items;

    return items.filter((item) =>
        normalizeText(item.name).includes(normalizedKeyword)
    );
}

async function getById(id) {
    const res = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
    }));
    return res.Item;
}

async function create(product) {
    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: product
    }));
    return product;
}

async function update(product) {
    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: product
    }));
    return product;
}

async function remove(id) {
    await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id }
    }));
}

module.exports = { getAll, getById, create, update, remove };