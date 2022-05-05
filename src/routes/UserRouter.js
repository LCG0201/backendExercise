const { Router } = require("express");
const UserRouter = Router();
const { User } = require("../model/User");
const mongoose = require("mongoose");

UserRouter.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.send({ user });
  } catch (error) {
    console.log({ error: error });
  }
});
UserRouter.get("/", async (req, res) => {
  try {
    const user = await User.findOne();
    return res.send({ user });
  } catch (error) {
    console.log({ error: error });
  }
});

module.exports = { UserRouter };
