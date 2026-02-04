import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/aws.js";

const TableName = 'ProductLogs';

export const createLog = async (log) => {
    await ddb.send(new PutCommand({
        TableName,
        Item: log
    }));
};
