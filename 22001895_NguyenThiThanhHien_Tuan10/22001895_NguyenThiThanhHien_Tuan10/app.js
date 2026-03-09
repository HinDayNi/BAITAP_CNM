
require('dotenv').config();
var express = require('express');
var path = require('path');
var morgan = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const productRoutes = require("./routes/productRoutes")

app.use("/", productRoutes)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

