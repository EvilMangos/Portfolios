const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  path: {
    type: String,
    reuired: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  comments: [commentSchema],
});

module.exports = imageSchema;
