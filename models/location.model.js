const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    locationName: String,
    locateBar: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bar"
      }],

})

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;