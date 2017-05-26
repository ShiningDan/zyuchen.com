let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let AbstractSchema = new Schema({
  title: String,
  abstract: String,
  link: String,
  comments: [{
    type: String,
  }],                     // should be ref
  categories: [{
    type: String
  }],                     
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

AbstractSchema.pre('save', function(next) {
  if (this.isNew) {
    // the value number of time set by user ending with 100000          
    if (this.meta.createAt.valueOf()%100000 !== 0) {
      this.meta.createAt = Date.now();
    }
    if (this.meta.updateAt.valueOf()%100000 !== 0) {
      this.meta.updateAt = Date.now();
    }
  } else {
    if (this.meta.updateAt.valueOf()%100000 !== 0) {
      this.meta.updateAt = Date.now();
    }
  }
  next();
});

module.exports = AbstractSchema;