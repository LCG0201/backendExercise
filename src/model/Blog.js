const { timeStamp } = require("console");
const { Schema, model, Types } = require("mongoose");

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    main: { type: String, required: true },
    islive: { type: Boolean, require: true, default: false },
    user: { type: Types.ObjectId, required: true, ref: "user" },
  },
  { timestamps: true }
);

BlogSchema.virtual("comments", {
  ref: "comment",
  localField: "_id",
  foreignField: "blog",
});

BlogSchema.set("toObject", { virtuals: true });
BlogSchema.set("toJSON", { virtuals: true });

const Blog = model("blog", BlogSchema);
module.exports = { Blog };
