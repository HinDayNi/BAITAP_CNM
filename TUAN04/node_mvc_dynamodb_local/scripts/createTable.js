const { CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { client } = require("../config/db");

const createTable = async () => {
    try {
        // Check if table exists
        const listCommand = new ListTablesCommand({});
        const { TableNames } = await client.send(listCommand);

        if (TableNames.includes("Users")) {
            console.log("Table 'Users' already exists.");
            return;
        }

        const command = new CreateTableCommand({
            TableName: "Users",
            AttributeDefinitions: [
                { AttributeName: "UserID", AttributeType: "S" }
            ],
            KeySchema: [
                { AttributeName: "UserID", KeyType: "HASH" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        });

        const response = await client.send(command);
        console.log("Table 'Users' created successfully:", response.TableDescription.TableName);
    } catch (error) {
        console.error("Error creating table:", error);
    }
};

createTable();
