const express = require('express');
const router = express.Router();

const User = require('../models/User')

//login page
router.get('/login', (req, res) => res.render('login'));

//Register page
router.get('/register', (req, res) => res.render('register'));

//handling register
router.post('/register', (req, res) => {
    const { name, email } = req.body;
    let errors = [];
    if (!name || !email) {
        errors.push({ msg: 'Please enter all fields' });
    }
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email
        });
    } else {
        //check for valid 
        User.findOne({ email: email }).then(user => {
            if (user) {
                //if user already exixt
                errors.push({ msg: 'Email ID already exists' });
                res.render('register', {
                    errors,
                    name,
                    email
                });
            } else {
                const newUser = new User({
                    name,
                    email
                });

                //save user
                newUser
                    .save()
                    .then(user => {
                        req.flash(
                            'success_msg',
                            'Registered successfully... Plz log in'
                        );
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
            }
        });
    }
});

//handling Login
router.post('/login', (req, res) => {
    const { name, email } = req.body;
    //ckecking user in db
    User.findOne({
        email: email
    }).then(user => {
        if (!user) {
            let errors = [];
            errors.push({ msg: 'This email is not registered' });
            res.render('login', {
                errors,
                name,
                email
            });
        }
        //redirect to dashboard
        else {
            res.redirect(`/dashboard?user=${user.email}`);
        }
    });

});

//handling logout
router.get('/logout', (req, res) => {
    // req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;