# Node.js MVC + DynamoDB Local

This project demonstrates how to connect a Node.js MVC application to a local DynamoDB instance running via Docker.

## Setup Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### 2. Start DynamoDB Local
Run the following command to start DynamoDB and the Admin UI:

```bash
docker-compose up -d
```

- **DynamoDB Local**: `http://localhost:8000`
- **DynamoDB Admin UI**: `http://localhost:8001`

### 3. Initialize Database
A script is provided to create the `Users` table automatically.

```bash
node scripts/createTable.js
```

### 4. Run the Application
Start the Node.js Expres server:

```bash
node app.js
```

Access the application at: `http://localhost:3001`

## Project Structure

- `config/db.js`: DynamoDB Client configuration (Region: us-west-2, Endpoint: localhost:8000).
- `controller/userController.js`: Handles business logic for adding/deleting users.
- `model/userModel.js`: Interactions with DynamoDB (Put, Scan, Delete).
- `views/index.ejs`: Frontend UI.
- `docker-compose.yml`: Configuration for local DynamoDB and Admin tool.

## Note
This project uses `@aws-sdk/client-dynamodb` (v3) for modern interactions.
