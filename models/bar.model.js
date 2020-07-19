const mongoose = require('mongoose');

const barSchema = new mongoose.Schema({
    barName: {
        type: String,
        required: true
      },
    barLocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location"
      },
    address: String,
    contactNo: String,
    barImage: String,
    HHStartPrice: Number,
    HHPricePerPint: [{
        HHbrewType: String,
        HHprice: Number,
    }],
    NHPricePerPint: [{
        NHbrewType: String,
        NHprice: Number,
    }],
    userReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rate_reviews: [Number],
    final_rating: Number,
    user_comments: [String],
    isFeatured: Boolean,

})


const Bar = mongoose.model("Bar", barSchema);
module.exports = Bar;
