const { Router } = require("express");
const res = require("express/lib/response");
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

    const comment = new Comment({
      content,
      user,
      userFullName: `${user.name.first} ${user.name.last}`,
      blog,
    });
    await Promise.all([
      comment.save(),
      Blog.updateOne({ _id: blogId }, { $push: { comments: comment } }),
    ]);
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

CommentRouter.patch("/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (typeof content !== "string") {
      return res.status(400).send({ error: "content need String" });
    }
    const [comment] = await Promise.all([
      Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true }),
      Blog.updateOne(
        { "comments._id": commentId },
        { "comments.$.content": content }
      ),
    ]);
    return res.send({ comment });
  } catch (error) {
    console.log({ error: error });
    res.status(500).send({ error: error.message });
  }
});

CommentRouter.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findOneAndDelete({ _id: commentId });
  await Blog.updateOne(
    { "comments._id": commentId },
    { $pull: { comments: { _id: commentId } } }
  );
  return res.send({ comment });
});
module.exports = { CommentRouter };
