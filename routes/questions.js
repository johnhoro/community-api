var express = require("express");
const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Comment = require("../models/Comment");
const auth = require("../middlewares/auth");
var router = express.Router();

/* create new question */

router.post("/", auth.isLoggedIn, async function (req, res, next) {
  let data = req.body;
  try {
    data.author = req.user.userId;

    let question = await Question.create(data);

    let updatedUser = await User.findByIdAndUpdate(req.user.userId, {
      $push: { questions: question.id },
    });

    res.json({ question });
  } catch (error) {
    next(error);
  }
});

//get list of all questions

router.get("/", auth.isLoggedIn, async function (req, res, next) {
  try {
    let questions = await Question.find({}).populate("author", "-password");
    res.json({ questions });
  } catch (error) {
    next(error);
  }
});

/* update question */

router.put("/:questionId", auth.isLoggedIn, async function (req, res, next) {
  try {
    let data = req.body;
    let questionId = req.params.questionId;

    let question = await Question.findById(questionId).populate("author");
    if (question && question.author.id === req.user.userId) {
      let updatedQuestion = await Question.findByIdAndUpdate(questionId, data, {
        new: true,
      });
      return res.json({ question: updatedQuestion });
    } else {
      return res
        .status(400)
        .json({ error: "You don't have required permission" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/* delete  question */

router.delete("/:slug", auth.isLoggedIn, async function (req, res, next) {
  try {
    let loggedUser = req.user;
    let question = await Question.findOne({ slug: req.params.slug }).populate(
      "author"
    );
    console.log(question.id, question.author.id, req.user.userId);

    if (question && question.author.id === req.user.userId) {
      var deletedQuestion = await Question.findByIdAndDelete(question.id);

      let updatedUser = await User.findOneAndUpdate(
        { username: loggedUser.username },
        { $pull: { questions: question.id } }
      );
      return res.json({ status: "success" });
    }

    throw new Error("You don't have required permission");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//create new answer

router.post("/:questionId/answers", auth.isLoggedIn, async (req, res, next) => {
  let questionId = req.params.questionId;
  let loggedUser = req.user;

  let data = req.body;
  try {
    let profile = await User.findOne({ email: loggedUser.email });

    data.author = loggedUser.userId;
    data.questionId = questionId;

    let answer = await Answer.create(data);

    let updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        $push: { answers: answer.id },
      },
      { new: true }
    ).populate("answers");

    let updatedUser = await User.findOneAndUpdate(
      { username: loggedUser.username },
      { $push: { answers: answer.id } }
    );

    res.json({ question: updatedQuestion });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//list of all answers of question

router.get("/:questionId/answers", auth.isLoggedIn, async (req, res, next) => {
  let questionId = req.params.questionId;
  try {
    let question = await Question.findById(questionId).populate("answers");
    return res.json({ answers: question });
  } catch (error) {
    next(error);
  }
});

//upvote question

router.post("/:questionId/upvote", auth.isLoggedIn, async (req, res, next) => {
  let questionId = req.params.questionId;
  try {
    let loggedProfile = await User.findById(req.user.userId);

    if (loggedProfile.upvotedQuestions.includes(questionId)) {
      throw new Error("Already upvoted");
    } else {
      let updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        {
          $inc: { upvoteCount: 1 },
          $push: { upvotedBy: loggedProfile.id },
        },
        { new: true }
      );

      let updatedProfile = await User.findByIdAndUpdate(loggedProfile.id, {
        $push: { upvotedQuestions: updatedQuestion.id },
      });

      return res.json({ question: updatedQuestion });
    }
  } catch (error) {
    next(error);
  }
});

//remove upvote question

router.post(
  "/:questionId/removeupvote",
  auth.isLoggedIn,
  async (req, res, next) => {
    let questionId = req.params.questionId;
    try {
      let loggedProfile = await User.findById(req.user.userId);

      if (loggedProfile.upvotedQuestions.includes(questionId)) {
        let updatedQuestion = await Question.findByIdAndUpdate(questionId, {
          $inc: { upvoteCount: -1 },
          $pull: { upvotedBy: loggedProfile.id },
        });

        let updatedProfile = await User.findByIdAndUpdate(loggedProfile.id, {
          $pull: { upvotedQuestions: updatedQuestion.id },
        });

        return res.json({ question: updatedQuestion });
      } else {
        throw new Error("You have not upvoted a question");
      }
    } catch (error) {
      next(error);
    }
  }
);

//create new comment on question

router.post("/:questionId/comment", auth.isLoggedIn, async (req, res, next) => {
  let loggedProfile = req.user;
  let questionId = req.params.questionId;

  let data = req.body;
  try {
    let profile = await User.findOne({ username: loggedProfile.username });

    data.author = profile.id;
    data.questionId = questionId;
    let comment = await Comment.create(data);

    let updatedQuestion = await Question.findByIdAndUpdate(questionId, {
      $push: { comments: comment.id },
    });

    let updatedProfile = await User.findByIdAndUpdate(profile.id, {
      $push: { comments: comment.id },
    });

    return res.json({ comment });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
