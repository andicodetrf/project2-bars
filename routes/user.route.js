//BAR OWNERS USER PROFILE to edit or delete bar

//get & show
const userRouter = require('express').Router();
const User = require('../models/user.model');
const Bar = require('../models/bar.model');
const Location = require('../models/location.model');

const isLoggedIn = require('../lib/loginBlocker');

userRouter.get('/show', async (req,res) => {
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

    if(req.user.isBarOwner){
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
                            req.flash('success', 'bar created');
                            res.redirect('/user/show');
                        })    
                })
            })
            .catch((err) => {
                console.log(err)
            })

        }
});
    


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


userRouter.post('/edit/:id', async (req,res) => {

    // console.log('edit post ---> ', req.body)
    try {
       
            let updateBar = await Bar.findByIdAndUpdate(req.params.id, req.body)
            
            if(updateBar) {
                // res.send('bar updated')
                res.redirect('/user/show');

            }
     
    } catch(error){
        console.log(error);
    }

})

/* DELETE BAR */
userRouter.get('/delete/:id', async (req,res) => {
    try {
        if(req.user.isBarOwner){
            let barShowDelete = await Bar.findByIdAndDelete(req.params.id)
            
            if(barShowDelete) {
                res.redirect('/user/show');
            }
        } else {
            res.redirect('/');
        }

    } catch(error){
        console.log(error);
    }
})






module.exports = userRouter;
