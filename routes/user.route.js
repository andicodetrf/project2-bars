//BAR OWNERS USER PROFILE to edit or delete bar

//get & show
const userRouter = require('express').Router();
const User = require('../models/user.model');
const Bar = require('../models/bar.model');
const Location = require('../models/location.model');
const isLoggedIn = require('../lib/loginBlocker');
const multer = require('multer');
const path = require('path');

//SET STORAGE ENGINE
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

//INIT UPLOAD 
const upload = multer({
    storage: storage,
    limits: {fileSize: 5000000}, 
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('barImage');


//CHECKUPLOADFILE
function checkFileType(file, cb){
    //allowed ext
    const filetypes = /jpeg|jpg|png/;

    //check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    //checkmime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: .jpg, .jpeg, .png only')
    }

}


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


userRouter.post('/create', (req,res) => {
    // console.log(req.body);
    upload(req,res, (err) => {
        if(err){
            res.render('user/uploadImgErr', {msg:err})
        } else {
            console.log(req.file);
            let newBar = new Bar(req.body)

            if(req.file){

                newBar.barImage = `/uploads/${req.file.filename}`
            }

            newBar            
            .save()
            .then(() => {
                User.findByIdAndUpdate(req.user._id, {
                    $push: {barsOwned: newBar._id}
                }).then(() => {
                            Location.findByIdAndUpdate(req.body.barLocate, {
                                $push: {locateBar: newBar._id}
                            }).then(()=> {
                                req.flash('success', 'bar created');
                                res.redirect('/user/show');
                            })    
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    });
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
userRouter.post('/edit/:id', (req,res) => {
    let barID = req.params.id;
    // console.log('edit post ---> ', req.body)
    upload(req,res, (err) => {
        if(err){
            res.render('user/replaceImgErr', {msg:err, barID})
        } else {
            console.log(req.file)
            let updateBar;

            if(!req.file) {
                updateBar = Bar.findByIdAndUpdate(req.params.id, req.body)

            } else {
                let { barName, barLocate, address, contactNo, openingHour, HHStartTime, HHEndTime, HHStartPrice,pintPrice} = req.body;

                updateBar = Bar.findByIdAndUpdate(req.params.id, {barName, barLocate, address, contactNo, openingHour, HHStartTime, HHEndTime, HHStartPrice,pintPrice, barImage: `/uploads/${req.file.filename}`})
            }

            updateBar
            .then(()=> {
                res.redirect('/user/show');

            })
            .catch(err => {
            console.log(err);
            })
        }
    })
})


//ORIGINAL EDIT BAR
// userRouter.post('/edit/:id', async (req,res) => {

//     // console.log('edit post ---> ', req.body)
//     try {
    
//             let updateBar = await Bar.findByIdAndUpdate(req.params.id, req.body)
            
//             if(updateBar) {
//                 // res.send('bar updated')
//                 res.redirect('/user/show');

//             }
     
//     } catch(error){
//         console.log(error);
//     }

// })

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

// userRouter.get('/delete/:id', (req, res) => {
//     if (req.user.isBarOwner) {
//         Bar.findByIdAndDelete(req.params.id)
//         .then(() => {
//             User.findByIdAndUpdate(req.user._id, { $pull: { barsOwned: req.params.id }})
//         })
//         .catch((err) => {
//             console.log(err);
//         })
//     }
// });

//ADMIN ONLY
userRouter.get('/admin/settings', (req,res) => {
    res.render('user/adminSet')
    
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
    console.log('$$$$$', req.body)
    console.log(req.body.isFeatured)
    console.log('LENGTH', req.body.isFeatured.length)
    // let item =[];
    // if(req.body.isFeatured.length > 0){
    //     req.body.isFeatured.forEach((list) => {
    //         item.push(list)
    //     })
        
    // } else {
    //     item.push(req.body.isFeatured)
    // }

    // // if(req.body.isFeatured){
    // if(item){
    //     Bar.find()
    //     .then((bars) => {
    //         bars.forEach((bar) => {
    //             bar.isFeatured = false;
    //             bar.save()
    //             .then(() => {
    //                 console.log('AAAAAAA--------------', bar)

    //                 // req.body.isFeatured.forEach((itemID) => {
    //                 item.forEach((itemID) => {
    //                     Bar.findById(itemID)
    //                     .then((b)=> {
    //                         b.isFeatured = true
    //                         console.log('XXXXX--------------', b)
    //                         b.save()
    //                         .then(() => {
    //                             res.redirect('/')
    //                         }).catch((err) => {
    //                             console.log(err)
    //                         })
    //                     }).catch((err) => {
    //                         console.log(err)
    //                     })
            
    //                 })

    //             })
    //         })
    //     }).catch((err) => {console.log(err)})

        
    // } else {
    //     res.send('select bars for featured')
    // }
})




//POST TO UPDATE FEATURE LIST
// userRouter.post('/admin/featured', (req,res) => {
//     // console.log(req.user)
//     console.log(req.body)
//     console.log(req.body.isFeatured)

    

//     if(req.body.isFeatured){
//         Bar.find()
//         .then((bars) => {
//             bars.forEach((bar) => {
//                 bar.isFeatured = false;
//                 bar.save()
//                 .then(() => {
//                     console.log('AAAAAAA--------------', bar)



//                 })
//             })
//         }).catch((err) => {console.log(err)})


//         req.body.isFeatured.forEach((itemID) => {
//             Bar.findById(itemID)
//             .then((b)=> {
//                 b.isFeatured = true
//                 console.log('XXXXX--------------', b)
//                 b.save()
//                 .then(() => {
//                     res.redirect('/')
//                 })
//             }).catch((err) => {
//                 console.log(err)
//             })

//         })
//     } else {
//         res.send('select bars for featured')
//     }
// })

module.exports = userRouter;
