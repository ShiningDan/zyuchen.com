let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

let ArticleSchema = new Schema({
  title: String,
  content: String,
  contentWebp: String,
  md: String,
  link: String,
  comments: [{
    type: String,
  }],                 // should be ref
  categories: [{
    type: String,
  }], 
  series: [{
    type: String,
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

ArticleSchema.pre('save', function(next) {
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

module.exports = ArticleSchema;