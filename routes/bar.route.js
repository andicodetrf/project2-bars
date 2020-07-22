const barRouter = require("express").Router();
const Bar = require("../models/bar.model");
const User = require("../models/user.model");
const Location = require("../models/location.model");
const isLoggedIn = require("../lib/loginBlocker");

//Display Bars by location

barRouter.get("/locations", async (req, res) => {
	// res.send('list of location')

	try {
		let listLocations = await Location.find();

		if (listLocations) {
			res.render("bar/locationSelect", { listLocations });
		}
	} catch (error) {
		console.log(error);
	}
});

barRouter.get("/locations/:id", async (req, res) => {
	try {
		// let barsFound = await Bar.find().populate('barLocate');
		// let locate = await Location.findById(req.params.id);
		//     res.render('bar/barsByLocation', {barsFound, locate})

		let barsInLocation = await Location.findById(req.params.id)
		.populate(
			{path: "locateBar",
			options: {sort: 'HHStartPrice'}, //mongoose
		})

		// .sort('HHStartPrice');

		console.log('############', barsInLocation);

		res.render("bar/barsByLocation", { barsInLocation });
	} catch (error) {
		console.log(error);
	}
});

barRouter.get("/bar/:id", async (req, res) => {
	try {
		let barFound = await Bar.findById(req.params.id).populate("barLocate");

        /*get value of final_rating but not yet update into bar*/
        let total = 0;
		let finalR = 0;
		if(barFound.rate_reviews.length > 0){
			barFound.rate_reviews.forEach((a)=> {
				total = total + a;
			})

			console.log('total', total)
			finalR = (total / barFound.rate_reviews.length).toFixed(1);

			console.log(finalR)

		}
			/*update into bar*/
			let barFinalR = await Bar.findByIdAndUpdate(req.params.id, {final_rating : finalR})

			if(barFinalR){
				console.log('bfr', barFinalR)
			}

			// console.log(barFound)
			res.render("bar/barInfo", { barFound});
		
	} catch (error) {
		console.log(error);
	}
});


barRouter.get('/search', async (req,res) => {
	
	let searched = req.query.search;
	// console.log(req.query)

	try {
		
		let totalResults = await Bar.find().populate('barLocate')

		console.log('total results ----->', totalResults)

		let searchedResults = totalResults.filter(bar => {
            return bar.pintPrice[0].brewType.toLowerCase().includes(req.query.search) || bar.pintPrice[1].brewType.toLowerCase().includes(req.query.search) ||
			bar.barName.toLowerCase().includes(req.query.search) ||
				bar.barLocate.locationName.toLowerCase().includes(req.query.search) ||
				bar.HHStartPrice.toString().includes(req.query.search) 
				
		});
		console.log('searchedResults----------', searchedResults)


		res.render("bar/results", {
				searchedResults,
				searched,
		})
            
	} catch (error) {}

});


/*ADVANCED SEARCH */

barRouter.get("/advSearch", async (req, res) => {
	
	try {

		let searchLoc = req.query.locORbrew
		let lowerCaseSearcLoc = req.query.locORbrew.toLowerCase();
		let searchHHPrice = req.query.HHPrice
		let totalResults = await Bar.find().populate('barLocate')

		console.log(searchLoc)

	
		let searchedResults = totalResults.filter(bar => {
			// return bar.barLocate.locationName.toLowerCase().includes(lowerCaseSearcLoc) && bar.HHStartPrice.toString().includes(req.query.HHPrice) 
			
			return (bar.barLocate.locationName.toLowerCase().includes(lowerCaseSearcLoc) || (bar.pintPrice[0].brewType.toLowerCase().includes(lowerCaseSearcLoc) || bar.pintPrice[1].brewType.toLowerCase().includes(lowerCaseSearcLoc))) && bar.HHStartPrice.toString().includes(req.query.HHPrice) 
				
		});

		if (searchedResults) {
			console.log("from search ----> ", searchedResults);
			res.render("bar/advResults", {
				searchedResults,
				searchLoc, searchHHPrice
			});
		}
	} catch (error) {}

});




barRouter.post('/rate/:id', (req,res) => {
    console.log(req.body.rate_reviews);

    Bar.findByIdAndUpdate(req.params.id, {$push :{rate_reviews: req.body.rate_reviews}
    }).then((bar)=> {
        console.log('post --> ', bar)
        
        res.redirect('/bar/bar/'+bar._id)

    }).catch(err => {
        console.log(err)
    })

})

module.exports = barRouter;
