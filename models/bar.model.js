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
    openingHour: String,
    HHStartTime: Number,
    HHEndTime: Number, 
    HHStartPrice: Number,
    pintPrice: [{
        brewType: String,
        HHprice: Number,
        NHprice: Number,
    }],
    barImage: String,
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
