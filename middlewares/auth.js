let jwt = require("jsonwebtoken");

module.exports = {
  isLoggedIn: async (req, res, next) => {
    var token = req.headers.authorization?.split(" ")[1] || null;

    try {
      if (token) {
        const payload = await jwt.verify(token, process.env.SECRET);
        req.user = payload;
      } else {
        return res
          .status(400)
          .json({ error: "You are not login, please login " });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  isAdmin: async (req, res, next) => {
    var token = req.headers.authorization?.split(" ")[1] || null;
    if (!token) {
      return res.status(400).json({ error: "token required" });
    }

    try {
      let payload = await jwt.verify(token, process.env.SECRET);
      console.log(payload);
      if (!payload.isAdmin) {
        return res
          .status(400)
          .json({ error: "You have to be loggedin as Admin" });
      }
      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  },
};
