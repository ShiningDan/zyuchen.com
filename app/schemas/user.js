let mongoose = require("mongoose");
let bcrypt = require("bcrypt");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let UserSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },    
  password: String,   
  // 0: normal user
  // 1: verified user
  // 2: professional user
  // >10: admin
  // > 50: super admin
  role: {
    type: Number,
    default: 0,
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now(),
    },
    updateAt: {
      type: Date,
      default: Date.now(),
    }
  }
});

UserSchema.pre('save', function(next) {
  let user = this;
  if (this.isNew) {
      this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
      this.meta.updateAt = Date.now();
  }
  next();
});

UserSchema.methods = {
  comparePassword: function(_password, cb) {
    if (this.password === _password) {
      return true;
    }
    return false;
  } 
}

module.exports = UserSchema;