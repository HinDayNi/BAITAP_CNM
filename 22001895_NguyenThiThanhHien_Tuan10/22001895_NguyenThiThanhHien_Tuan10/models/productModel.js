const { dynamoDB, TABLE_NAME } = require("../config/aws");
const { ScanCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// 1. Lấy tất cả
async function getAllProduct() {
    const res = await dynamoDB.send(new ScanCommand({ TableName: TABLE_NAME }));
    return res.Items || [];
}

// 2. Lấy theo ID
async function getProductById(id) {
    const res = await dynamoDB.send(new GetCommand({ TableName: TABLE_NAME, Key: { ID: id } }));
    return res.Item;
}

// 3. Thêm mới
async function addProduct(product) {
    return await dynamoDB.send(new PutCommand({ TableName: TABLE_NAME, Item: product }));
}

// 4. Cập nhật
async function updateProduct(id, p) {
    return await dynamoDB.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { ID: id },
        UpdateExpression: "SET #n=:n, price=:p, quantity=:q, image=:i",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: { ":n": p.name, ":p": Number(p.price), ":q": Number(p.quantity), ":i": p.image }
    }));
}

// 5. Xóa
async function deleteProduct(id) {
    return await dynamoDB.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { ID: id } }));
}

// 6. TÌM KIẾM (Cách ngắn nhất: dễ nhớ, dễ đi thi)
async function searchProduct(keyword) {
    const all = await getAllProduct();
    if (!keyword) return all;
    // Chỉ cần chuyển về chữ thường rồi dùng includes là xong
    return all.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
}

module.exports = { getAllProduct, getProductById, addProduct, updateProduct, deleteProduct, searchProduct };
