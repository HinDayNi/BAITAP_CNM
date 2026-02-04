import { CreateTableCommand, DescribeTableCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from '../config/aws.js';

const tables = [
    {
        TableName: 'Users',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }]
    },
    {
        TableName: 'Categories',
        KeySchema: [{ AttributeName: 'categoryId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'categoryId', AttributeType: 'S' }]
    },
    {
        TableName: process.env.DYNAMO_TABLE || 'Products', // Use env var if set, else 'Products'
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }]
    },
    {
        TableName: 'ProductLogs',
        KeySchema: [{ AttributeName: 'logId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'logId', AttributeType: 'S' }]
    }
];

export async function ensureTablesExist() {
    console.log('Checking DynamoDB tables...');
    try {
        const { TableNames } = await ddbClient.send(new ListTablesCommand({}));

        for (const tableConfig of tables) {
            if (!TableNames.includes(tableConfig.TableName)) {
                console.log(`Table ${tableConfig.TableName} does not exist. Creating...`);
                await ddbClient.send(new CreateTableCommand({
                    ...tableConfig,
                    BillingMode: 'PAY_PER_REQUEST'
                }));
                console.log(`Table ${tableConfig.TableName} created.`);
            } else {
                console.log(`Table ${tableConfig.TableName} exists.`);
            }
        }
    } catch (error) {
        console.error('Error ensuring tables exist:', error);
    }
}
