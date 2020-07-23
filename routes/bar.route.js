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

		res.render("bar/barInfo", { barFound});
		
	} catch (error) {
		console.log(error);
	}
});

barRouter.post('/rate/:id', (req,res) => {
	// console.log(req.body.rate_reviews);
		
    Bar.findByIdAndUpdate(req.params.id, {$push :{rate_reviews: req.body.rate_reviews}}, {new: true}
    ).then((bar)=> { 

		// console.log('post --> ', bar)

		let total = 0;
		let finalR = 0;
		// console.log('LINE 88 LENGTH ---->', bar.rate_reviews.length)
		if(bar.rate_reviews.length > 0){
			bar.rate_reviews.forEach((a)=> {
				total = total + a;
			})

			// console.log('total', total)
			finalR = (total / bar.rate_reviews.length).toFixed(1);

			// console.log(finalR)

			} else {
				finalR = req.body.rate_reviews;
			}
			/*update final rating into bar*/
			Bar.findByIdAndUpdate(req.params.id, {final_rating : finalR})
			.then((bar) => {
				// console.log('------FINAL----->', bar)
				res.redirect('/bar/bar/'+bar._id)
			})
        	
    }).catch(err => {
        console.log(err)
    })

})


barRouter.get('/search', async (req,res) => {
	
	let searched = req.query.search;
	let searchedLowCase = req.query.search.toLowerCase();

	// console.log(req.query)

	try {
		
		let totalResults = await Bar.find().sort({HHStartPrice:1}).populate('barLocate')

		console.log('total results ----->', totalResults)

		let searchedResults = totalResults.filter(bar => {
            return bar.pintPrice[0].brewType.toLowerCase().includes(searchedLowCase) || bar.pintPrice[1].brewType.toLowerCase().includes(searchedLowCase) ||
			bar.barName.toLowerCase().includes(searchedLowCase) ||
				bar.barLocate.locationName.toLowerCase().includes(searchedLowCase) ||
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
		let searchHHPrice;
		let searchNHPrice;

		if(!req.query.HHPrice && !req.query.NHPrice && lowerCaseSearcLoc){
			searchHHPrice = '1';
			searchNHPrice = '1';
			
		}


		if(req.query.HHPrice){
			searchHHPrice =  req.query.HHPrice;
			searchNHPrice = '1';
		} else if( req.query.NHPrice){
			searchHHPrice =  '1';
			searchNHPrice = req.query.NHPrice;
		}

		//BEFORE SORT
		// let totalResults = await Bar.find().populate('barLocate')
		
		//RESULTS WILL NOW BE SORTED HHPRICE ASC
		let totalResults = await Bar.find().populate('barLocate').sort({HHStartPrice:1})


		console.log(searchLoc)
	
		let searchedResults = totalResults.filter(bar => {
			// return bar.barLocate.locationName.toLowerCase().includes(lowerCaseSearcLoc) && bar.HHStartPrice.toString().includes(req.query.HHPrice) 
			// console.log(typeof req.query.NHPrice)
			// console.log('---')
			// console.log(typeof (bar.pintPrice[0].NHprice).toString())
			
			return (bar.pintPrice[0].brewType.toLowerCase().includes(lowerCaseSearcLoc) || bar.pintPrice[1].brewType.toLowerCase().includes(lowerCaseSearcLoc) || bar.barLocate.locationName.toLowerCase().includes(lowerCaseSearcLoc)) && (bar.HHStartPrice.toString().includes(searchHHPrice)) && (bar.pintPrice[0].NHprice).toString().includes(searchNHPrice) 

			//OR doesnt work
			// && (bar.HHStartPrice.toString().includes(req.query.HHPrice) || (bar.pintPrice[0].NHprice).toString().includes(req.query.NHPrice))
				
		});

		if (searchedResults) {
			console.log("from search ----> ", searchedResults);
			res.render("bar/advResults", {
				searchedResults,
				searchLoc, searchHHPrice, searchNHPrice
			});
		}
	} catch (error) {}

});




module.exports = barRouter;
