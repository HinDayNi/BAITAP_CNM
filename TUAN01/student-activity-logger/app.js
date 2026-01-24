const logger = require("./logger");

logger.emit("login", "Alice");

logger.emit("view_lesson", {
  name: "Alice",
  lesson: "Node.js Events",
});

logger.emit("submit_assignment", {
  name: "Alice",
  assignment: "Lab 3",
});

logger.emit("logout", "Alice");

logger.emit("quiz_attempt", {
  name: "Bob",
  score: 8,
  total: 10,
});

logger.emit("error", "Database connection failed");
