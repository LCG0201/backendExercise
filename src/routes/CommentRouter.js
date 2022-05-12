const { Router } = require("express");
const CommentRouter = Router({ mergeParams: true });
const { isValidObjectId } = require("mongoose");
const { Blog, User, Comment } = require("../model");

CommentRouter.post("/", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, userId } = req.body;

    if (!isValidObjectId(blogId))
      return res.status(400).send({ error: "blogId is invalid" });
    if (!isValidObjectId(userId))
      return res.status(400).send({ error: "userId is invalid" });
    if (typeof content !== "string")
      return res.status(400).send({ error: "content is required" });

    /*이거는 비효율이니까
    const blog = await Blog.findById(blogId);
    const user = await User.findById(userId);*/
    const [blog, user] = await Promise.all([
      Blog.findById(blogId),
      User.findById(userId),
    ]);
    //블로그와 유저가 존재하는지 검사
    if (!blog || !user)
      return res.status(400).send({ error: "blog or user does not exist" });
    //조건- 블로그의 islive가 true인지 검사
    if (!blog.islive)
      return res.status(400).send({ error: "blog is not available" });

    const comment = new Comment({ content, user, blog });
    await comment.save();
    return res.send({ comment });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

CommentRouter.get("/", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      return res.status(400).send({ error: "blogId is invalid" });

    const comments = await Comment.find({ blog: blogId });
    return res.send({ comments });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

module.exports = { CommentRouter };
