require("dotenv").config();
const express = require("express");
const app = express();

// DynamoDB
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand
} = require("@aws-sdk/lib-dynamodb");

// Setup DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const docClient = DynamoDBDocumentClient.from(client);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Route: Home - List products
app.get("/", async (req, res) => {
  try {
    const data = await docClient.send(
        new ScanCommand({ TableName: process.env.DYNAMO_TABLE })
    );
    res.render("index", { items: data.Items || [] });
  } catch (err) {
    console.error(err);
    res.send("Error loading items");
  }
});

// Route: Form Add
app.get("/add", (req, res) => {
  res.render("add");
});

// Route: Handle Add POST
app.post("/add", async (req, res) => {
  const { id, name, quantity } = req.body;

  try {
    await docClient.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TABLE,
          Item: { id, name, quantity: Number(quantity) }
        })
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error adding item");
  }
});

// Run server
app.listen(3000, () => console.log("Server running http://localhost:3000"));
