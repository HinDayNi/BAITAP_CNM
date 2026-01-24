const EventEmitter = require("events");
const fs = require("fs");

class StudentLogger extends EventEmitter {}

const logger = new StudentLogger();

function logToFile(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;

  fs.appendFile("activity.log", logMessage, (err) => {
    if (err) {
      console.error("Error writing log:", err);
    }
  });
}

logger.on("login", (studentName) => {
  logToFile(`Student ${studentName} logged in`);
});

logger.on("view_lesson", (data) => {
  logToFile(`Student ${data.name} viewed lesson ${data.lesson}`);
});

logger.on("submit_assignment", (data) => {
  logToFile(`Student ${data.name} submitted assignment ${data.assignment}`);
});

logger.on("logout", (name) => {
  logToFile(`Student ${name} logged out`);
});

logger.on("quiz_attempt", (data) => {
  logToFile(`Student ${data.name} attempted quiz: ${data.score}/${data.total}`);
});

const path = require("path");

function logToFile(message) {
  const date = new Date().toISOString().split("T")[0];
  const dir = "logs";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, `activity-${date}.log`);
  fs.appendFile(filePath, message + "\n", () => {});
}

logger.on("error", (err) => {
  fs.appendFile("error.log", err + "\n", () => {});
});

module.exports = logger;
