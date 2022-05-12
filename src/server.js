const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { BlogRouter, UserRouter } = require("./routes");
const { generateFakeData } = require("../faker");

const MONGO_URI =
  "mongodb+srv://gilee:PJQIbRvkFQQ4u3gh@changgilee.5u0n5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const server = async () => {
  try {
    const monggoDBConeection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //await generateFakeData(10, 5, 30);//
    console.log("mongodb is connected");

    app.use(express.json());
    app.use("/blog", BlogRouter);
    app.use("/user", UserRouter);

    app.listen(3000, () => console.log("server is listing on port 3000"));
  } catch (error) {
    console.log(error);
  }
};
server();
