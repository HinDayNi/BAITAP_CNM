const express = require('express');
const app = express();
const session = require('express-session');

// 1) Session BEFORE parsing body is ok, nhưng để chuẩn ta để body parser sau
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 2) Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3) View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// 4) Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const isAuthenticated = require('./middlewares/auth');

app.use('/', authRoutes);
app.use('/', isAuthenticated, productRoutes);

// 5) Server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
