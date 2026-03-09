const {dynamoDB} = require("../config/aws")
const {ScanCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb")

const TABLE_NAME = "Products"

// Lấy toàn bộ sản phẩm
async function getAllProduct (){
    const command = new ScanCommand({
        TableName: TABLE_NAME
    })

    return (await dynamoDB.send(command)).Items
}

//  Lấy 1 sản phẩm theo ID
async function getProductById (id){
    const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            ID: id
        }
    })

    return (await dynamoDB.send(command)).Item
}

// Thêm sản phẩm
async function addProduct (product){
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: product
    })

    return await dynamoDB.send(command)
}

// Cập nhật sản phẩm
async function updateProduct(id, product){
    const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
            ID: id
        },
        UpdateExpression: "SET #name = :name, price = :price, quantity = :quantity, image = :image",
        ExpressionAttributeNames: {
            "#name": "name",
        },
        ExpressionAttributeValues: {
            ":name": product.name,
            ":price": product.price,
            ":quantity": product.quantity,
            ":image": product.image
        }
    })

    return await dynamoDB.send(command)
}

// Xóa sản phẩm
async function deleteProduct(id){
    const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
            ID: id
        }
    })

    return await dynamoDB.send(command)
}

// Tìm kiếm sản phẩm theo tên
async function searchProduct(keyword){
    const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "contains(#name, :keyword)",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":keyword": keyword
        }
    })
    return (await dynamoDB.send(command)).Items
}

module.exports = {
    getAllProduct,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProduct
}

