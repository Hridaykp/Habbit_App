const express = require('express');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const PORT = 8000;

const db = require('./config/mongoose').MongoURI;

//connecting to database
mongoose.connect(db, { 
    useNewUrlParser: true, useUnifiedTopology: true 
    }, (err) => {
        if(err){
            console.log(err)
        }else{
            console.log("Successfully connected to MongoDB !!")
        }
    }
);
//EJS
app.use(expressLayouts);
app.use("/assets", express.static('./assets'));
app.set('view engine', 'ejs');

//Body-parser
app.use(express.urlencoded({ extended: false }));

//Express-session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//flash
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


app.listen(PORT,  console.log(`Server ruuning on port: ${PORT}`));


