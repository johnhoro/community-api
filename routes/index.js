var express = require("express");
const auth = require("../middlewares/auth");
const Question = require("../models/Question");
let _ = require("lodash");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//get list of all tags

router.get("/tags", auth.isLoggedIn, async (req, res, next) => {
  try {
    let questions = await Question.find({});
    let arrOfTags = questions.reduce((acc, cv) => {
      acc.push(cv.tags);
      return acc;
    }, []);
    console.log(arrOfTags);
    arrOfTags = _.flattenDeep(arrOfTags);
    arrOfTags = _.uniq(arrOfTags);
    return res.json({ tags: arrOfTags });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
