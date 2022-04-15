var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Comment = require("../models/Comment");
const auth = require("../middlewares/auth");

//update answer

router.put("/:answerId", auth.isLoggedIn, async (req, res, next) => {
  let answerId = req.params.answerId;
  let data = req.body;
  let loggedUser = req.user;

  try {
    let answer = await Answer.findById(answerId).populate("author");

    if (answer && answer.author.id === loggedUser.userId) {
      let updatedAnswer = await Answer.findByIdAndUpdate(answerId, data, {
        new: true,
      });
      return res.json({ answer: updatedAnswer });
    } else {
      throw new Error("You don't have required permission");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//delete answer

router.delete("/:answerId", auth.isLoggedIn, async (req, res, next) => {
  let answerId = req.params.answerId;
  let loggedUser = req.user;

  try {
    let answer = await Answer.findById(answerId).populate("author");

    if (answer && answer.author.id === loggedUser.userId) {
      let deletedAnswer = await Answer.findByIdAndDelete(answerId);
      let updatedQuestion = await Question.findByIdAndUpdate(
        deletedAnswer.questionId,
        { $pull: { answers: deletedAnswer.id } }
      );

      let updatedUser = await User.findOneAndUpdate(
        { username: loggedUser.username },
        { $pull: { answers: deletedAnswer.id } }
      );

      return res.json({ status: "success" });
    } else {
      throw new Error("You don't have required permission");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//upvote answerId

router.post("/:answerId/upvote", auth.isLoggedIn, async (req, res, next) => {
  let answerId = req.params.answerId;
  try {
    let loggedProfile = await User.findById(req.user.userId);

    if (loggedProfile.upvotedAnswers.includes(answerId)) {
      throw new Error("Already upvoted");
    } else {
      let updatedAnswer = await Answer.findByIdAndUpdate(
        answerId,
        {
          $inc: { upvoteCount: 1 },
          $push: { upvotedBy: loggedProfile.id },
        },
        { new: true }
      );

      let updatedProfile = await User.findByIdAndUpdate(loggedProfile.id, {
        $push: { upvotedAnswers: updatedAnswer.id },
      });

      return res.json({ answer: updatedAnswer });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//remove upvote answerId

router.post(
  "/:answerId/removeupvote",
  auth.isLoggedIn,
  async (req, res, next) => {
    let answerId = req.params.answerId;
    try {
      let loggedProfile = await User.findById(req.user.userId);

      if (loggedProfile.upvotedAnswers.includes(answerId)) {
        let updatedAnswer = await Answer.findByIdAndUpdate(
          answerId,
          {
            $inc: { upvoteCount: -1 },
            $pull: { upvotedBy: loggedProfile.id },
          },
          { new: true }
        );
        let updatedProfile = await User.findByIdAndUpdate(loggedProfile.id, {
          $pull: { upvotedAnswers: updatedAnswer.id },
        });
        return res.json({ answer: updatedAnswer });
      } else {
        throw new Error("You have not upvoted a answer");
      }
    } catch (error) {
      next(error);
    }
  }
);

//create new comment on answer

router.post("/:answerId/comment", auth.isLoggedIn, async (req, res, next) => {
  let loggedProfile = req.user;
  let answerId = req.params.answerId;

  let data = req.body;
  try {
    let profile = await User.findOne({ username: loggedProfile.username });

    data.author = profile.id;
    data.answerId = answerId;
    let comment = await Comment.create(data);

    let updatedAnswer = await Answer.findByIdAndUpdate(answerId, {
      $push: { comments: comment.id },
    });

    let updatedProfile = await User.findByIdAndUpdate(profile.id, {
      $push: { comments: comment.id },
    });

    return res.json({ comment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
