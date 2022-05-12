const { Router } = require("express");
const UserRouter = Router();
const { User } = require("../model/User");
const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");

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
UserRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      res.status(400).send({ error: "userId is invalid" });
    }
    const user = await User.findOne({ _id: userId });
    return res.send({ user });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

module.exports = { UserRouter };
