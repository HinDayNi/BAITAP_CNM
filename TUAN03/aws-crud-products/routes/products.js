var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();

var { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
var { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
var { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
var { v4: uuidv4 } = require('uuid');

var ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
var ddb = DynamoDBDocumentClient.from(ddbClient);

var s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Function to create DynamoDB table if it doesn't exist
async function ensureTableExists() {
    try {
        await ddbClient.send(new DescribeTableCommand({
            TableName: process.env.DYNAMO_TABLE
        }));
        console.log('Table exists:', process.env.DYNAMO_TABLE);
    } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
            console.log('Table does not exist, creating:', process.env.DYNAMO_TABLE);
            try {
                await ddbClient.send(new CreateTableCommand({
                    TableName: process.env.DYNAMO_TABLE,
                    KeySchema: [
                        { AttributeName: 'id', KeyType: 'HASH' }
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'id', AttributeType: 'S' }
                    ],
                    BillingMode: 'PAY_PER_REQUEST'
                }));
                console.log('Table created successfully');

                // Wait for table to be active
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (createError) {
                console.error('Error creating table:', createError);
            }
        } else {
            console.error('Error checking table:', error);
        }
    }
}

// READ - List all
router.get('/', async function(req, res) {
    let products = [];
    let title = 'Product List';

    try {
        console.log('Ensuring table exists...');
        await ensureTableExists();

        console.log('Attempting to fetch products from DynamoDB...');
        console.log('Table name:', process.env.DYNAMO_TABLE);
        console.log('Region:', process.env.AWS_REGION);

        const result = await ddb.send(new ScanCommand({
            TableName: process.env.DYNAMO_TABLE
        }));

        products = result.Items || [];
        console.log('Successfully fetched', products.length, 'products');

    } catch (error) {
        console.error('Error fetching products:', error.message);
        console.error('Error details:', error);
        // Keep empty array for products, but ensure we still render
    }

    // Always render with both required variables
    res.render('index', { title, products });
});

// CREATE - Show form
router.get('/product-add', function(req, res) {
    res.render('product-add', {title: "Add Product"});
});

// CREATE - Submit
router.post('/product-add', upload.single('image'), async function(req, res) {
    try {
        const id = uuidv4();
        const Key = `${Date.now()}-${req.file.originalname}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

        await ddb.send(new PutCommand({
            TableName: process.env.DYNAMO_TABLE,
            Item: {
                id,
                name: req.body.name,
                price: Number(req.body.price),
                quantity: Number(req.body.quantity),
                url_image: imageUrl
            }
        }));

        res.redirect('/products');
    } catch (error) {
        console.error('Error adding product:', error);
        res.render('product-add', {title: "Add Product", error: error.message});
    }
});

// UPDATE - Show edit form
router.get('/edit/:id', async function(req, res) {
    try {
        const result = await ddb.send(new ScanCommand({ TableName: process.env.DYNAMO_TABLE }));
        const product = result.Items.find(p => p.id === req.params.id);
        res.render('product-edit', { product, title: 'Edit Product' });
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        res.redirect('/products');
    }
});

// UPDATE - Submit
router.post('/edit', upload.single('image'), async function(req, res) {
    try {
        let imageUrl = req.body.oldImage;

        if (req.file) {
            const Key = `${Date.now()}-${req.file.originalname}`;

            await s3.send(new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }));

            imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
        }

        await ddb.send(new UpdateCommand({
            TableName: process.env.DYNAMO_TABLE,
            Key: { id: req.body.id },
            UpdateExpression: "set #n=:n, price=:p, quantity=:q, url_image=:u",
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: {
                ":n": req.body.name,
                ":p": Number(req.body.price),
                ":q": Number(req.body.quantity),
                ":u": imageUrl
            }
        }));

        res.redirect('/products');
    } catch (error) {
        console.error('Error updating product:', error);
        res.redirect('/products');
    }
});

// DELETE
router.get('/delete/:id', async function(req, res) {
    try {
        await ddb.send(new DeleteCommand({
            TableName: process.env.DYNAMO_TABLE,
            Key: { id: req.params.id }
        }));
        res.redirect('/products');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.redirect('/products');
    }
});

module.exports = router;
