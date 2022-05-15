const { Router } = require("express");
const BlogRouter = Router();
const { Blog, User } = require("../model");
const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const { CommentRouter } = require("./CommentRouter");

//comment-자식
BlogRouter.use("/:blogId/comment", CommentRouter);

BlogRouter.post("/", async (req, res) => {
  try {
    const { title, main, islive, userId } = req.body;
    if (typeof title !== "string") {
      return res.status(400).send({ error: "title is required" });
    }
    if (typeof main !== "string") {
      return res.status(400).send({ error: "main is required" });
    }
    if (islive && typeof islive !== "boolean") {
      return res.status(400).send({ error: "islive is must be a boolean" });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).send({ error: "user doesn't exist" });
    }

    let blog = new Blog({ ...req.body, user });
    await blog.save();
    return res.send({ blog });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

BlogRouter.get("/", async (req, res) => {
  try {
    let { page } = req.query;
    page = parseInt(page);
    console.log(page);
    const blogs = await Blog.find({})
      .sort({ updatedAt: -1 })
      .skip(20 * page)
      .limit(20);
    // .populate([
    //   { path: "user" },
    //   { path: "comments", populate: { path: "user" } },
    // ]);
    return res.send({ blogs });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

BlogRouter.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) {
      res.status(400).send({ error: "blogId is invalid" });
    }
    const blog = await Blog.findOne({ _id: blogId });
    return res.send({ blog });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

//전체수정
BlogRouter.put("/:blogId", async (req, res) => {
  try {
    const { title, main } = req.body;
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      res.status(400).send({ error: "blogId is invalid" });
    if (typeof title !== "string")
      res.status(400).send({ error: "title is required" });
    if (typeof main !== "string")
      res.status(400).send({ error: "main is required" });

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { title, main },
      { new: true }
    );
    return res.send({ blog });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

//부분수정
BlogRouter.patch("/:blogId/live", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      res.status(400).send({ error: "blogId is invalid" });

    const { islive } = req.body;
    if (typeof islive !== "boolean")
      res.status(400).send({ error: "boolean islive is required" });

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { islive },
      { new: true }
    );
    return res.send({ blog });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

module.exports = { BlogRouter };
