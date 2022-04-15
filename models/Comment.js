let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    text: { type: String, unique: true, require: true },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    answerId: { type: mongoose.Types.ObjectId, ref: "Answer" },
    questionId: { type: mongoose.Types.ObjectId, ref: "Question" },
  },
  { timestamps: true }
);

let Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
