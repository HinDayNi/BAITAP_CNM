require("dotenv").config();
const { client, TABLE_NAME } = require("../config/dynamodb");
const { CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

async function initTable() {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        console.log("Table da ton tai:", TABLE_NAME);
        return;
    } catch (err) {
        if (err.name !== "ResourceNotFoundException") throw err;
    }

    await client.send(
        new CreateTableCommand({
            TableName: TABLE_NAME,
            AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
            KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
            BillingMode: "PAY_PER_REQUEST"
        })
    );

    console.log("Da tao bang:", TABLE_NAME);
}

module.exports = { initTable };

if (require.main === module) {
    initTable().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}