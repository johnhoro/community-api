let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let answerSchema = new Schema(
  {
    text: { type: String, require: true },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    upvoteCount: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    questionId: { type: mongoose.Types.ObjectId, ref: "Question" },
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

let Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
