console.log("Hello Node.js!")

const mathUtils = require('./mathUtils')
const greeting = require('./greeting')

console.log("Add:", mathUtils.add(5, 3));
console.log("Subtract:", mathUtils.subtract(10, 4));
console.log("Multiply:", mathUtils.multiply(3, 5));

console.log("Say Hello:", greeting.sayHello("Hiền"));