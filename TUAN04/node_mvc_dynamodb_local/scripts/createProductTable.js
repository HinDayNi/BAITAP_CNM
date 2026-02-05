const { CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { client } = require("../config/db");

const createTable = async () => {
    try {
        const listCommand = new ListTablesCommand({});
        const { TableNames } = await client.send(listCommand);

        if (TableNames.includes("Products")) {
            console.log("Table 'Products' already exists.");
            return;
        }

        const command = new CreateTableCommand({
            TableName: "Products",
            AttributeDefinitions: [
                { AttributeName: "id", AttributeType: "S" }
            ],
            KeySchema: [
                { AttributeName: "id", KeyType: "HASH" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        });

        const response = await client.send(command);
        console.log("Table 'Products' created successfully:", response.TableDescription.TableName);
    } catch (error) {
        console.error("Error creating table:", error);
    }
};

createTable();
