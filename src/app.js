require("dotenv").config()
require('./config/passport.config'); // import Passport config
const express = require("express")
const app = express()
const connectDB = require('./config/db.config')
const path = require('path')
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
const sessionConfig = require('./middlewares/session.middleware')
const flash = require('connect-flash')
const flashMsg = require('./middlewares/flash.middleware')
const method = require('method-override')
const passport = require('passport')
const nocache = require('nocache')
const { success, render } = require('./helpers/response.helper')
const handleError = require('./helpers/handleError.helper')
const { HTTP_STATUS } = require('./constants')

//settings
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))
app.locals.title = process.env.TITLE

//session
sessionConfig(app)

//third party middlwares
app.use(flash())
app.use(flashMsg)
app.use(passport.initialize())
app.use(passport.session())

// Global user & response helper middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.success = (message, data, statusCode) => success(res, message, data, statusCode);
  res.renderPage = (view, data, statusCode) => render(res, view, data, statusCode);
  next();
});
app.use(method('_method'))
app.use(nocache())

//built in middlwares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

//routers
app.use('/admin', adminRoutes)
app.use('/',userRoutes)

//pagenotfound
app.use((req, res, next) => {
  render(res, 'userPages/404', { url: req.originalUrl }, HTTP_STATUS.NOT_FOUND);
})

// Global error handler
app.use((err, req, res, next) => {
  handleError(res, 'GlobalError', err);
});

//app.listen to start server based mongoDB connected or not
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
  })
})
