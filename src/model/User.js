const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: {
      name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
      },
      nickname: { type: String, required: true },
    },
    age: Number,
    email: String,
  },
  { timestamps: true }
);

const User = model("user", UserSchema);
module.exports = { User };
