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

// Global user middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
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
  res.status(404).render('userPages/404', { url: req.originalUrl })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err);
  const isApi = req.xhr || (req.headers.accept || '').includes('application/json');
  if (isApi) return res.status(500).json({ success: false, message: 'Internal server error' });
  res.status(500).render('userPages/500', { message: err.message });
});

//app.listen to start server based mongoDB connected or not
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`server running on http://localhost:${process.env.PORT}`);
  })
})
