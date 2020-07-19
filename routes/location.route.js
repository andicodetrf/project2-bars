//only admin can add location
const locRouter = require('express').Router();
const Location = require('../models/location.model')

//Route to create location page + show all registered locations
locRouter.get('/create', async (req, res) => {
    // res.send('create location page')
    try{
        let reglocations = await Location.find();
        res.render('location/create', {reglocations})

    } catch(error) {
        console.log(error)
    }
});


//register new location & reroute to create loc page
locRouter.post('/create', async (req, res) => {
    // console.log(req.body);
    try{
    
    let newLocation = new Location(req.body)
    let savedLocation = await newLocation.save();

    if(savedLocation) {
        console.log('saved location ---> ', savedLocation)
        res.redirect('/location/create');
    }
    }catch(error) {

        console.log(error)
    }

});




module.exports = locRouter;