const express = require('express');
const router = express.Router();

//models
const User = require('../models/User');
const Habit = require('../models/Habit');

//opening page
router.get('/', (req, res) => res.render('welcome'));

//rendering dashboaed
var email = "";
router.get('/dashboard', (req, res) => {
    email = req.query.user;
    User.findOne({
        email: req.query.user
    }).then(user => {
        Habit.find({
            email: req.query.user
        }, (err, habits) => {
            if (err) console.log(err);
            else {
                var days = [];
                days.push(getD(0));
                days.push(getD(1));
                days.push(getD(2));
                days.push(getD(3));
                days.push(getD(4));
                days.push(getD(5));
                days.push(getD(6));
                res.render('dashboard', { habits, user, days });
            }
        });
    })
}
);

// function for returning date
function getD(n) {
    let d = new Date();
    d.setDate(d.getDate() + n);
    var newDate = d.toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '-' );
    var day;
    switch (d.getDay()) {
        case 0: day = 'Sun';
            break;
        case 1: day = 'Mon';
            break;
        case 2: day = 'Tue';
            break;
        case 3: day = 'Wed';
            break;
        case 4: day = 'Thu';
            break;
        case 5: day = 'Fri';
            break;
        case 6: day = 'Sat';
            break;
    }
    return { date: newDate, day };
}

//handling changes (daily => weekly) vice-versa
router.post('/user-view', (req, res) => {
    User.findOne({
        email
    })
        .then(user => {
            user.view = user.view === 'daily' ? 'weekly' : 'daily';
            user.save()
                .then(user => {
                    return res.redirect('back');
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log("Error changing view!");
            return;
        })
})

//Dashboard Add Habit
router.post('/dashboard', (req, res) => {
    const { content } = req.body;

    Habit.findOne({ content: content, email: email }).then(habit => {
        if (habit) {
            //update existing habbit
            let dates = habit.dates, tzoffset = (new Date()).getTimezoneOffset() * 60000;
            var today = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
            dates.find(function (item, index) {
                if (item.date === today) {
                    console.log("Habit exists!")
                    req.flash(
                        'error_msg',
                        'Habit already exists!'
                    );
                    res.redirect('back');
                }
                else {
                    dates.push({ date: today, complete: 'none' });
                    habit.dates = dates;
                    habit.save()
                        .then(habit => {
                            console.log(habit);
                            res.redirect('back');
                        })
                        .catch(err => console.log(err));
                }
            });
        }
        else {
            let dates = [], tzoffset = (new Date()).getTimezoneOffset() * 60000;
            var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
            dates.push({ date: localISOTime, complete: 'none' });
            const newHabit = new Habit({
                content,
                email,
                dates
            });

            //for saving habit
            newHabit
                .save()
                .then(habit => {
                    console.log(habit);
                    res.redirect('back');
                })
                .catch(err => console.log(err));
        }
    })
});

//adding & removing favorite
router.get("/favorite-habit", (req, res) => {
    let id = req.query.id;
    Habit.findOne({
        _id: {
            $in: [
                id
            ]
        },
        email
    })
        .then(habit => {
            habit.favorite = habit.favorite ? false : true;
            habit.save()
                .then(habit => {
                    req.flash(
                        'success_msg',
                        habit.favorite ? 'Successfuly added to fav list!!' : 'successfuly removed from fav list!'
                    );
                    return res.redirect('back');
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log("Error in adding to favorites!");
            return;
        })
});

//updation of habbit status
router.get("/status-update", (req, res) => {
    var d = req.query.date;
    var id = req.query.id;
    Habit.findById(id, (err, habit) => {
        if (err) {
            console.log("Error updating status!")
        }
        else {
            let dates = habit.dates;
            let found = false;
            dates.find(function (item, index) {
                if (item.date === d) {
                    if (item.complete === 'yes') {
                        item.complete = 'no';
                    }
                    else if (item.complete === 'no') {
                        item.complete = 'none'
                    }
                    else if (item.complete === 'none') {
                        item.complete = 'yes'
                    }
                    found = true;
                }
            })
            if (!found) {
                dates.push({ date: d, complete: 'yes' })
            }
            habit.dates = dates;
            habit.save()
                .then(habit => {
                    console.log(habit);
                    res.redirect('back');
                })
                .catch(err => console.log(err));
        }
    })

})

//for deleting habbit
router.get("/remove", (req, res) => {
    let id = req.query.id;
    Habit.deleteMany({
        _id: {
            $in: [
                id
            ]
        },
        email
    }, (err) => {
        if (err) {
            console.log("Error in removing habbit!");
        }
        else {
            req.flash(
                'success_msg',
                'Habbit(s) removed successfully!'
            );
            return res.redirect('back');
        }
    })
});

module.exports = router;