const mainRouter = require('express').Router();
const Bar = require('../models/bar.model');




mainRouter.get('/', (req,res) => {
    // res.send('port 4200 home page')

    Bar.find().populate('barLocate')
    .then((featuredBars) => {
        res.render('bar/dashboard', {featuredBars})
        // console.log(featuredBars)
    }).catch((err) => {
        console.log(err)
    })

})

module.exports = mainRouter;