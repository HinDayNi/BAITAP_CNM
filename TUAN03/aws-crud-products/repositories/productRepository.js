import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/aws.js";

const TableName = process.env.DYNAMO_TABLE || 'Products';

export const getAllProducts = async (filters = {}) => {
    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    // Soft delete check
    filterExpressions.push('(attribute_not_exists(isDeleted) OR isDeleted = :falseVal)');
    expressionAttributeValues[':falseVal'] = false;

    if (filters.categoryId) {
        filterExpressions.push('categoryId = :catId');
        expressionAttributeValues[':catId'] = filters.categoryId;
    }

    if (filters.minPrice) {
        filterExpressions.push('price >= :minPrice');
        expressionAttributeValues[':minPrice'] = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
        filterExpressions.push('price <= :maxPrice');
        expressionAttributeValues[':maxPrice'] = Number(filters.maxPrice);
    }

    if (filters.name) {
        filterExpressions.push('contains(#n, :nameVal)');
        expressionAttributeNames['#n'] = 'name';
        expressionAttributeValues[':nameVal'] = filters.name;
    }

    const params = {
        TableName,
        Limit: filters.limit || 100 // Default limit if not provided, though Scan with Filter works differently (limit applied before filter)
    };

    // Note: 'Limit' in Scan applies to items evaluated, NOT items returned.
    // Implementing true pagination with filtering in Scan is complex without complex loop or client-side logic.
    // For this lab, we will return ALL items then slice, OR assume the user accepts DynamoDB Scan behavior (limit scanned items).
    // Requirement says "Phân trang danh sách sản phẩm".
    // We will do simple in-memory pagination for Scan results because DynamoDB Scan Pagination + Filtering is erratic for UI pages.
    // However, if we must use DynamoDB native features:
    if (filters.exclusiveStartKey) {
        params.ExclusiveStartKey = JSON.parse(filters.exclusiveStartKey);
    }

    if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(' AND ');
        params.ExpressionAttributeValues = expressionAttributeValues;

        if (Object.keys(expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = expressionAttributeNames;
        }
    }

    const result = await ddb.send(new ScanCommand(params));
    return { items: result.Items || [], lastEvaluatedKey: result.LastEvaluatedKey };
};

export const getProductById = async (id) => {
    const result = await ddb.send(new GetCommand({
        TableName,
        Key: { id }
    }));
    return result.Item;
};

export const createProduct = async (product) => {
    await ddb.send(new PutCommand({
        TableName,
        Item: product
    }));
};

export const updateProduct = async (id, updates) => {
    // Construct dynamic update expression
    let updateExpression = "set";
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Always update timestamp? Maybe not needed for simple details update

    Object.keys(updates).forEach((key, index) => {
        if (key === 'id') return; // Don't update PK

        const valueKey = `:${key}`;
        let nameKey = key;

        if (key === 'name') { // 'name' is reserved keyword sometimes, safe to alias
            nameKey = '#n';
            expressionAttributeNames['#n'] = 'name';
        }

        updateExpression += ` ${nameKey} = ${valueKey},`;
        expressionAttributeValues[valueKey] = updates[key];
    });

    // Remove trailing comma
    updateExpression = updateExpression.slice(0, -1);

    const params = {
        TableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
    }

    await ddb.send(new UpdateCommand(params));
};

export const softDeleteProduct = async (id) => {
    await ddb.send(new UpdateCommand({
        TableName,
        Key: { id },
        UpdateExpression: "set isDeleted = :trueVal",
        ExpressionAttributeValues: {
            ":trueVal": true
        }
    }));
};
