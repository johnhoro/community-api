var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, minlength: 5, required: true },
    bio: { type: String, default: null },
    name: { type: String, default: null },
    image: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    upvotedQuestions: [{ type: mongoose.Types.ObjectId, ref: "Question" }],
    upvotedAnswers: [{ type: mongoose.Types.ObjectId, ref: "Answer" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (["admin@gmail.com", "john@gmail.com"].includes(this.email)) {
    this.isAdmin = true;
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.createToken = async function () {
  try {
    let payload = {
      userId: this.id,
      username: this.username,
      isAdmin: this.isAdmin,
    };

    let token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    bio: this.bio,
    image: this.image,
    name: this.name,
    followers: this.followers,
    following: this.following,
    token: token,
  };
};

userSchema.methods.profileJSON = function () {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    bio: this.bio,
    image: this.image,
    name: this.name,
    followers: this.followers,
    following: this.following,
  };
};

let User = mongoose.model("User", userSchema);

module.exports = User;
