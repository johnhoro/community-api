var express = require("express");
const User = require("../models/User");
var router = express.Router();

const auth = require("../middlewares/auth");

//get User information

router.get("/:username", auth.isLoggedIn, async (req, res, next) => {
  let givenUsername = req.params.username;
  try {
    let userInfo = await User.findOne({ username: givenUsername })
      .populate("followers")
      .populate("following");
    if (!userInfo) {
      return res.status(400).json({ error: "invalid username" });
    }
    res.json({ profile: userInfo.profileJSON() });
  } catch (error) {
    next(error);
  }
});

//update User information

router.put("/", auth.isLoggedIn, async (req, res, next) => {
  try {
    let data = req.body;
    let updatedUser = await User.findByIdAndUpdate(req.user.userId, data, {
      new: true,
    });
    updatedUser.isAdmin = ["admin@gmail.com", "john@gmail.com"].includes(
      updatedUser.email
    );
    await updatedUser.save();

    res.json({ user: updatedUser.userJSON() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
