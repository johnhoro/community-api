let mongoose = require("mongoose");
let slugger = require("slugger");

let Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    title: { type: String, unique: true, require: true },
    description: { type: String },
    slug: { type: String },
    tags: [{ type: String }],
    upvoteCount: { type: Number, default: 0 },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    upvotedBy: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
    answers: [{ type: mongoose.Types.ObjectId, ref: "Answer" }],
  },
  { timestamps: true }
);

questionSchema.pre("save", function (next) {
  if (this.title && this.isModified("title")) {
    this.slug = slugger(this.title);
  }
  next();
});

module.exports = mongoose.model("Question", questionSchema);
