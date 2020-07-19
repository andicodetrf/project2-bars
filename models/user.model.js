const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBarOwner: {
    type: Boolean,
    default: false
  },
  isPatron: {
    type: Boolean,
    default: false
  },
  barsOwned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bar"
    }
  ],
});

userSchema.pre("save", function(next) {
  let user = this;
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  //hash the password
  let hash = bcrypt.hashSync(user.password, 10);

  // Override the cleartext password with the hashed one
  user.password = hash;
  next();
});

userSchema.methods.validPassword = function(password) {
  // Compare is a bcrypt method that will return a boolean,
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
