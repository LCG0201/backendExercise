const { Router } = require("express");
const UserRouter = Router();
const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const { User, Blog, Comment } = require("../model");

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

UserRouter.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ error: "invalid userId" });
    const { username, name, age, email } = req.body;

    if (!username && !name && !age && !email)
      return res.status(400).send({ error: "i need data" });
    if (age && typeof age !== "number")
      return res.status(400).send({ error: "age is number" });
    if (email && typeof email !== "string")
      return res.status(400).send({ error: "email is string" });
    if (
      (name.first && typeof name.first !== "string") ||
      (name.last && typeof name.last !== "string")
    )
      return res.status(400).send({ error: "name is sting" });

    let user = await User.findById(userId);
    if (age) user.age = age;
    if (email) user.email = email;
    if (name) {
      user.name = name;
      await Promise.all([
        Blog.updateMany({ "user._id": userId }, { "user.name": name }),
        Blog.updateMany(
          {},
          { "comments.$[element].userFullName": `${name.first} ${name.last}` },
          { arrayFilters: [{ "element.user": userId }] }
        ),
      ]);
    }
    if (username) {
      user.username = username;
      await Blog.updateMany(
        { "user._id": userId },
        { "user.username": username }
      );
    }
    await user.save();
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

UserRouter.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ error: "invalid userId" });
    const [user] = await Promise.all([
      User.findOneAndDelete({ _id: userId }),
      Blog.deleteMany({ "user._id": userId }),
      Blog.updateMany(
        { "comments.user": userId },
        { $pull: { comments: { user: userId } } }
      ),
      Comment.deleteMany({ user: userId }),
    ]);

    return res.send({ user });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

module.exports = { UserRouter };
