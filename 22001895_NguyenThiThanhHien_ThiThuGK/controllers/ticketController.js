const { docClient, s3 } = require("../config/aws");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    GetCommand
} = require("@aws-sdk/lib-dynamodb");

function validateTicket(data) {
    const errors = [];

    if (!data.ticketId || data.ticketId.trim() === "") {
        errors.push("Mã vé không được rỗng");
    }

    if (!data.eventName || data.eventName.trim().length < 3) {
        errors.push("Tên sự kiện phải có ít nhất 3 ký tự");
    }

    if (isNaN(data.price) || Number(data.price) <= 0) {
        errors.push("Giá vé phải > 0");
    }

    if (isNaN(data.quantity) || Number(data.quantity) < 0) {
        errors.push("Số lượng phải >= 0");
    }

    return errors;
}

async function uploadToS3(file) {
    const fileName = Date.now() + "-" + file.originalname;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3.send(command);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}
async function deleteFromS3(imageUrl) {
    const fileName = imageUrl.split("/").pop();
    console.log("Deleting from S3 - URL:", imageUrl);
    console.log("Deleting from S3 - FileName:", fileName);

    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName
    });

    try {
        const result = await s3.send(command);
        console.log("✓ Successfully deleted from S3:", fileName);
        return result;
    } catch (err) {
        console.error("Error deleting from S3:", err.message);
        throw err;
    }
}

async function createTicket(ticket) {
    console.log("Creating ticket:", ticket);
    if (!ticket || !ticket.ticketId) {
        throw new Error("ticketId is required");
    }

    const errors = validateTicket(ticket);
    if (errors.length > 0) {
        throw new Error("Validation errors: " + errors.join(", "));
    }

    // Build the item to save - explicitly include all required fields
    const cleanItem = {
        ticketId: ticket.ticketId,
        eventName: ticket.eventName,
        price: ticket.price,
        quantity: ticket.quantity
    };

    // Only add imageUrl if it exists
    if (ticket.imageUrl) {
        cleanItem.imageUrl = ticket.imageUrl;
    }

    const params = {
        TableName: "EventTickets",
        Item: cleanItem
    };

    console.log("Sending to DynamoDB:", JSON.stringify(params, null, 2));

    try {
        await docClient.send(new PutCommand(params));
        console.log("Ticket saved successfully");
    } catch (error) {
        console.error("DynamoDB Error:", error.message);
        throw error;
    }
}

async function deleteTicket(ticketId) {
    const params = {
        TableName: "EventTickets",
        Key: { ticketId }
    };
    await docClient.send(new DeleteCommand(params));
}

async function getAllTickets() {
    const params = { TableName: "EventTickets" };
    const result = await docClient.send(new ScanCommand(params));
    return result.Items || [];
}

async function getTicketById(ticketId) {
    const params = {
        TableName: "EventTickets",
        Key: { ticketId }
    };
    const result = await docClient.send(new GetCommand(params));
    return result.Item || null;
}

async function updateTicket(ticketId, data) {
    let updateExpression = `SET eventName = :eventName, price = :price, quantity = :quantity`;
    let expressionAttributeValues = {
        ":eventName": data.eventName,
        ":price": Number(data.price),
        ":quantity": Number(data.quantity)
    };

    // Add imageUrl to update if provided
    if (data.imageUrl) {
        updateExpression += `, imageUrl = :imageUrl`;
        expressionAttributeValues[":imageUrl"] = data.imageUrl;
    }

    const params = {
        TableName: "EventTickets",
        Key: { ticketId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
    };
    await docClient.send(new UpdateCommand(params));
}

async function searchTickets(keyword) {
    const params = {
        TableName: "EventTickets",
        FilterExpression: "contains(eventName, :kw)",
        ExpressionAttributeValues: {
            ":kw": keyword
        }
    };

    const result = await docClient.send(new ScanCommand(params));
    return result.Items || [];
}

function calculateTotalRevenue(price, quantitySold) {
    return Number(price) * Number(quantitySold);
}

function calculateRemaining(quantity, quantitySold) {
    return Number(quantity) - Number(quantitySold);
}

module.exports = {
    validateTicket,
    createTicket,
    getAllTickets,
    getTicketById,
    deleteTicket,
    updateTicket,
    searchTickets,
    calculateTotalRevenue,
    calculateRemaining,
    uploadToS3,
    deleteFromS3
};