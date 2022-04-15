var express = require("express");
var router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

router.get("/", async (req, res) => {
  try {
    var user = await User.find({}).select("-password");
    res.json({ user: user });
  } catch (error) {
    return error;
  }
});

/* register user */

router.post("/register", async (req, res) => {
  try {
    var user = await User.create({ ...req.body, isAdmin: false });
    var token = await user.createToken();
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//login user

router.post("/login", async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email/password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email is not registered" });
    }
    const result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: "Incorrect Password" });
    }
    var token = await user.createToken();
    console.log(token);
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//get current user

router.get("/current-user", auth.isLoggedIn, async (req, res, next) => {
  let payload = req.user;

  var token = req.headers.authorization?.split(" ")[1] || null;
  try {
    let user = await User.findById(payload.userId);
    res.json({ user: await user.userJSON(token) });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//follow user

router.post("/:userId/follow", auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findById(loggedprofile.userId);
    if (userId === loggedUser.id) {
      return res.status(400).json({ error: "you cannot follow yourself" });
    } else if (loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: "you are already following a user" });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(
        userId,
        {
          $push: { followers: loggedUser.id },
        },
        { new: true }
      );

      let updatedUser = await User.findByIdAndUpdate(
        loggedUser.id,
        {
          $push: { following: userId },
        },
        { new: true }
      );

      return res.json({ user: updatedUser.userJSON() });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//unfollow user

router.post("/:userId/unfollow", auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findById(loggedprofile.userId);

    if (userId === loggedUser.id) {
      return res.status(400).json({ error: "you cannot unfollow yourself" });
    } else if (!loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: "you can not unfollow same person twice" });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { followers: loggedUser.id },
        },
        { new: true }
      );

      let updatedUser = await User.findByIdAndUpdate(
        loggedUser.id,
        {
          $pull: { following: userId },
        },
        { new: true }
      );

      return res.json({ user: updatedUser.userJSON() });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//block user by admin

router.post("/block/:userId", auth.isAdmin, async (req, res, next) => {
  let userId = req.params.userId;

  try {
    let updatedProfile = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );

    return res.json({ user: updatedProfile.userJSON() });
  } catch (error) {
    next(error);
  }
});

//unblock user by admin

router.post("/unblock/:userId", auth.isAdmin, async (req, res, next) => {
  let userId = req.params.userId;

  try {
    let updateduser = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );

    return res.json({ user: updateduser.userJSON() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
