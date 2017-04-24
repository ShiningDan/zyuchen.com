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
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
});

module.exports = AbstractSchema;