//BAR OWNERS USER PROFILE to edit or delete bar

//get & show
const userRouter = require('express').Router();
const User = require('../models/user.model');
const Bar = require('../models/bar.model');
const Location = require('../models/location.model');
const multer = require('multer');
const upload = multer({ dest: './public/uploads' });
const cloudinary = require("cloudinary");
// const isLoggedIn = require('../lib/loginBlocker');
// const path = require('path');


userRouter.get('/show/:userid', async (req,res) => {
    try {
        if (req.user.isBarOwner) {

            let userSelected = await User.findById(req.user._id).populate('barsOwned')
            let bar = await Bar.find()
            let location= await Location.find()
            
            res.render('user/ownerBars', {userSelected, bar, location})
        } else {
            res.redirect('/');
        }

    } catch(error) {
        console.log(error);
    }

})



/* CREATE BAR BY BAR OWNER ONLY*/
userRouter.get('/create', async (req,res) => {
    // res.send('Create Bar Page')
    try{
        if(req.user.isBarOwner){
            let selectLocation = await Location.find(); 
            res.render('user/createBar', {selectLocation});
        } else {
            res.redirect('/');
        }
    } catch(error) {
        console.log(error);
    }
        
})


userRouter.post('/create', upload.single("barImage"), (req,res) => {
    // console.log(req.body);
    if(req.file){
        cloudinary.uploader.upload(req.file.path, (result) => {
            // console.log('------------------RESULT ONLY', result);
            console.log(req.file);
            let newBar = new Bar(req.body)

            newBar.barImage = result.secure_url;
            // console.log('------------------RESULT URL', result.url);
            
            newBar            
            .save()
            .then(() => {
                User.findByIdAndUpdate(req.user._id, {
                    $push: {barsOwned: newBar._id}
                }).then(() => {
                            Location.findByIdAndUpdate(req.body.barLocate, {
                                $push: {locateBar: newBar._id}
                            }).then(()=> {
                                req.flash('success', 'Your bar has been created!');
                                res.redirect(`/user/show/${req.params.userid}`);
                            })    
                    })
                })
            .catch((error) => {
                console.log(error)
            })
        });
    } else {
        let newBar = new Bar(req.body)

            newBar            
            .save()
            .then(() => {
                User.findByIdAndUpdate(req.user._id, {
                    $push: {barsOwned: newBar._id}
                }).then(() => {
                            Location.findByIdAndUpdate(req.body.barLocate, {
                                $push: {locateBar: newBar._id}
                            }).then(()=> {
                                req.flash('success', 'Your bar has been created!');
                                res.redirect(`/user/show/${req.params.userid}`);
                            })    
                    })
                })
            .catch((error) => {
                console.log(error)
            })
    }
})


/* EDIT BAR INFO */

userRouter.get('/edit/:id', async (req,res) => {
        try {
            if(req.user.isBarOwner){
                let barShowEdit = await Bar.findById(req.params.id)
                let selectLocation = await Location.find();

                res.render('user/barEdit', {barShowEdit, selectLocation})
            }else {
                res.redirect('/');
            }

        } catch(error){
            console.log(error);
        }
})


//with multer
userRouter.post('/edit/:id', upload.single("barImage"), (req,res) => {
    // let barID = req.params.id;
    
    if(req.file){
        cloudinary.uploader.upload(req.file.path, (result) => {

            let updateBar;

                let { barName, barLocate, address, contactNo, openingHour, HHStartTime, HHEndTime, HHStartPrice,pintPrice} = req.body;

                updateBar = Bar.findByIdAndUpdate(req.params.id, {barName, barLocate, address, contactNo, openingHour, HHStartTime, HHEndTime, HHStartPrice,pintPrice, barImage: result.url})

                updateBar
                .then(()=> {
                    req.flash('success', 'Your bar has been updated!');
                    res.redirect(`/user/show/${req.params.userid}`);

                })
                .catch(err => {
                console.log(err);
                })

        })
    } else {

        Bar.findByIdAndUpdate(req.params.id, req.body)

            .then(()=> {
                    req.flash('success', 'Your bar has been updated!');
                    res.redirect(`/user/show/${req.params.userid}`);

            })
            .catch(err => {
                console.log(err);
            })
    } 

})



/* DELETE BAR */
userRouter.get('/delete/:barid/:userid', async (req,res) => {
    // console.log('REQ PARAMS ID', req.params.id);
    // console.log('REQ PARAMS ID BAR', req.params.barid);
    // console.log('REQ PARAMS ID USER', req.params.userid);
    try {
        if(req.user.isBarOwner){
            let barShowDelete = await Bar.findByIdAndDelete(req.params.barid)
            let userDeleteBar = await User.findByIdAndUpdate(req.params.userid, {$pull : {barsOwned: req.params.barid}})
            
            if(barShowDelete && userDeleteBar) {
                res.redirect(`/user/show/${req.params.userid}`);
            }
            // console.log('REQ PARAMS ID BAR', req.params.barid);
        } else {
            res.redirect('/');
        }

    } catch(error){
        console.log(error);
    }
})


//ADMIN ONLY
userRouter.get('/admin/settings', (req,res) => {

    User.find().populate('barsOwned')
    .then((users) => {
        res.render('user/adminSet', {users})

    })

    
})

//SHOW FEATURE LIST FOR UPDATE
userRouter.get('/admin/featured', async(req,res) => {

    try{

        let allBars = await Bar.find()
        // let admin = await User.find()

        res.render('bar/adminFeatList', {allBars})

    }catch(error){
        console.log(error)
    }
  
})


//POST TO UPDATE FEATURE LIST
userRouter.post('/admin/featured', (req,res) => {
    // console.log(req.user)
    // console.log('$$$$$', req.body)
    // console.log(req.body.isFeatured)
    // console.log('LENGTH', req.body.isFeatured.length)
    let items = req.body.isFeatured
 

    // if(req.body.isFeatured){
    if(items){
        //updateMany is from mongoDB
        Bar.updateMany({$set: { isFeatured: false }}, function(err, bar) {
            if(err){
                console.log(err);
            } else {
                console.log('success');

                let newArr = [];
                items.forEach(barID => {
                    newArr.push(Bar.findByIdAndUpdate(barID, {isFeatured: true}))
                });
                Promise.all(newArr).then(() => {
                    res.redirect('/')
                })

            }
        })
        
} else {

    Bar.updateMany({$set: { isFeatured: false }}).then((bar) => {
        console.log('else-----------------', bar)
        res.redirect('/')
    })
 
    }

})



module.exports = userRouter;
